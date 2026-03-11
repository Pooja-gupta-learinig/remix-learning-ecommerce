/**
 * HTML sanitization using regex
 * Removes dangerous tags and attributes
 */
function sanitizeHtmlServer(html: string): string {
	if (!html || typeof html !== "string") {
		return "";
	}

	// Remove script tags and their content
	let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
	
	// Remove event handlers and dangerous attributes
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");
	
	// Remove javascript: and data: URLs from href and src
	sanitized = sanitized.replace(/(href|src)\s*=\s*["']?(javascript|data|vbscript):[^"'\s>]*["']?/gi, "$1=\"#\"");
	
	// Remove iframe, object, embed tags
	sanitized = sanitized.replace(/<(iframe|object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, "");
	
	return sanitized;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Uses regex-based sanitization
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * ```ts
 * const clean = sanitizeHtml('<p>Hello <script>alert("xss")</script>World</p>');
 * // Returns: '<p>Hello World</p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
	if (!html || typeof html !== "string") {
		return "";
	}

	return sanitizeHtmlServer(html);
}

/**
 * Sanitizes HTML using the same regex-based sanitization
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtmlStrict(html: string): string {
	if (!html || typeof html !== "string") {
		return "";
	}

	return sanitizeHtmlServer(html);
}

/**
 * Sanitizes plain text by escaping HTML entities
 * Use this when you want to display text without any HTML rendering
 * 
 * @param text - The text to escape
 * @returns Escaped HTML string
 * 
 * @example
 * ```ts
 * const escaped = escapeHtml('<script>alert("xss")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
 * ```
 */
export function escapeHtml(text: string): string {
	if (!text || typeof text !== "string") {
		return "";
	}

	const map: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#x27;",
		"/": "&#x2F;",
	};

	return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

