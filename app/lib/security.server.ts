import { env } from "~/config.server";
import { sanitizeHtml, escapeHtml } from "~/lib/sanitize-html";

/**
 * Security headers configuration
 * Implements HTTP-first security best practices for Remix applications
 */
export function getSecurityHeaders(): HeadersInit {
	const isProduction = env.nodeEnv === "production";
	const headers = new Headers();

	// Content Security Policy - prevents XSS attacks
	// Adjust based on your app's needs (external APIs, CDNs, etc.)
	headers.set(
		"Content-Security-Policy",
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/unsafe-eval needed for Remix hydration
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"font-src 'self' https://fonts.gstatic.com data:",
			"img-src 'self' data: https: blob:",
			"connect-src 'self' https://dummyjson.com",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'",
			"upgrade-insecure-requests",
		].join("; ")
	);

	// X-Frame-Options - prevents clickjacking
	headers.set("X-Frame-Options", "DENY");

	// X-Content-Type-Options - prevents MIME type sniffing
	headers.set("X-Content-Type-Options", "nosniff");

	// Referrer-Policy - controls referrer information
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Permissions-Policy - restricts browser features
	headers.set(
		"Permissions-Policy",
		[
			"camera=()",
			"microphone=()",
			"geolocation=()",
			"interest-cohort=()",
		].join(", ")
	);

	// Strict-Transport-Security - enforces HTTPS in production
	if (isProduction) {
		headers.set(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains; preload"
		);
	}

	// X-XSS-Protection - legacy XSS protection (modern browsers ignore, but doesn't hurt)
	headers.set("X-XSS-Protection", "1; mode=block");

	// Remove X-Powered-By header to hide server technology
	// This is handled by the server configuration, but we document it here

	return headers;
}

/**
 * Sanitizes string input to prevent XSS attacks
 * Escapes HTML entities to ensure text is safe for display
 * Use this for plain text input that should not contain HTML
 * 
 * For HTML content that needs to be rendered, use sanitizeHtml() instead
 */
export function sanitizeInput(input: string): string {
	if (typeof input !== "string") {
		return "";
	}

	// Remove null bytes
	let sanitized = input.replace(/\0/g, "");

	// Escape HTML entities to prevent XSS
	sanitized = escapeHtml(sanitized);

	return sanitized.trim();
}

/**
 * Sanitizes an object by sanitizing all string values
 * Useful for sanitizing form data before processing
 */
export function sanitizeObject<T extends Record<string, unknown>>(
	obj: T
): T {
	const sanitized = { ...obj };

	for (const key in sanitized) {
		if (typeof sanitized[key] === "string") {
			sanitized[key] = sanitizeInput(sanitized[key] as string) as T[Extract<
				keyof T,
				string
			>];
		} else if (
			sanitized[key] !== null &&
			typeof sanitized[key] === "object" &&
			!Array.isArray(sanitized[key])
		) {
			sanitized[key] = sanitizeObject(
				sanitized[key] as Record<string, unknown>
			) as T[Extract<keyof T, string>];
		} else if (Array.isArray(sanitized[key])) {
			sanitized[key] = (sanitized[key] as unknown[]).map((item) =>
				typeof item === "string"
					? sanitizeInput(item)
					: typeof item === "object" && item !== null
						? sanitizeObject(item as Record<string, unknown>)
						: item
			) as T[Extract<keyof T, string>];
		}
	}

	return sanitized;
}

/**
 * Validates CSRF token from request
 * In Remix, CSRF protection is primarily handled by SameSite cookies,
 * but this provides additional validation for sensitive operations
 */
export function validateCsrfToken(
	request: Request,
	expectedToken?: string
): boolean {
	// Remix automatically validates SameSite cookies, which provides CSRF protection
	// For additional security, you can implement token-based CSRF protection here
	// For now, we rely on SameSite cookie protection which is sufficient for most cases

	// Check Origin header for cross-origin requests
	const origin = request.headers.get("Origin");
	const host = request.headers.get("Host");

	if (origin && host) {
		try {
			const originUrl = new URL(origin);
			// In production, ensure origin matches expected domain
			if (env.nodeEnv === "production") {
				// You should configure your allowed origins
				// For now, we check that origin hostname matches request hostname
				const requestUrl = new URL(request.url);
				if (originUrl.hostname !== requestUrl.hostname) {
					return false;
				}
			}
		} catch {
			// Invalid origin URL
			return false;
		}
	}

	// If an expected token is provided, validate it
	if (expectedToken) {
		const token = request.headers.get("X-CSRF-Token");
		return token === expectedToken;
	}

	return true;
}

/**
 * Validates HTTP method for state-changing operations
 * Ensures only appropriate methods are used
 */
export function validateHttpMethod(
	request: Request,
	allowedMethods: string[]
): boolean {
	return allowedMethods.includes(request.method);
}

/**
 * Rate limiting helper (in-memory, simple implementation)
 * For production, use a proper rate limiting solution like Redis
 */
const rateLimitStore = new Map<
	string,
	{ count: number; resetTime: number }
>();

export function checkRateLimit(
	identifier: string,
	maxRequests: number,
	windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
	const now = Date.now();
	const record = rateLimitStore.get(identifier);

	// Clean up old records periodically
	if (rateLimitStore.size > 10000) {
		for (const [key, value] of rateLimitStore.entries()) {
			if (value.resetTime < now) {
				rateLimitStore.delete(key);
			}
		}
	}

	if (!record || record.resetTime < now) {
		// New or expired record
		rateLimitStore.set(identifier, {
			count: 1,
			resetTime: now + windowMs,
		});
		return {
			allowed: true,
			remaining: maxRequests - 1,
			resetAt: now + windowMs,
		};
	}

	if (record.count >= maxRequests) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: record.resetTime,
		};
	}

	record.count++;
	return {
		allowed: true,
		remaining: maxRequests - record.count,
		resetAt: record.resetTime,
	};
}

/**
 * Gets client IP address from request
 * Useful for rate limiting and logging
 */
export function getClientIp(request: Request): string {
	// Check various headers that proxies might set
	const forwarded = request.headers.get("X-Forwarded-For");
	if (forwarded) {
		// X-Forwarded-For can contain multiple IPs, take the first one
		return forwarded.split(",")[0]?.trim() || "unknown";
	}

	const realIp = request.headers.get("X-Real-IP");
	if (realIp) {
		return realIp;
	}

	// Fallback - in a real server, you'd get this from the connection
	return "unknown";
}

