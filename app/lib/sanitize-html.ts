import DOMPurify from "isomorphic-dompurify";

/**
 * Configuration for DOMPurify sanitization
 * Allows safe HTML tags and attributes while preventing XSS attacks
 */
const sanitizeConfig = {
	ALLOWED_TAGS: [
		"p",
		"br",
		"strong",
		"em",
		"u",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"ul",
		"ol",
		"li",
		"a",
		"blockquote",
		"code",
		"pre",
		"span",
		"div",
		"img",
	],
	ALLOWED_ATTR: [
		"href",
		"title",
		"alt",
		"src",
		"class",
		"id",
		"target",
		"rel",
	],
	ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
	ADD_ATTR: ["target"],
	ADD_TAGS: [],
	FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "button"],
	FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
	KEEP_CONTENT: true,
	RETURN_DOM: false,
	RETURN_DOM_FRAGMENT: false,
	RETURN_TRUSTED_TYPE: false,
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Works on both server and client
 * 
 * @param html - The HTML string to sanitize
 * @param config - Optional DOMPurify configuration override
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * ```ts
 * const clean = sanitizeHtml('<p>Hello <script>alert("xss")</script>World</p>');
 * // Returns: '<p>Hello World</p>'
 * ```
 */
export function sanitizeHtml(html: string, config?: Parameters<typeof DOMPurify.sanitize>[1]): string {
	if (!html || typeof html !== "string") {
		return "";
	}

	const finalConfig = config ? { ...sanitizeConfig, ...config } : sanitizeConfig;
	const result = DOMPurify.sanitize(html, finalConfig);
	return typeof result === "string" ? result : String(result);
}

/**
 * Sanitizes HTML and returns a trusted type (if supported)
 * Useful for strict Content Security Policy environments
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtmlStrict(html: string): string {
	if (!html || typeof html !== "string") {
		return "";
	}

	const result = DOMPurify.sanitize(html, {
		...sanitizeConfig,
		RETURN_TRUSTED_TYPE: true,
	});
	return typeof result === "string" ? result : String(result);
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

