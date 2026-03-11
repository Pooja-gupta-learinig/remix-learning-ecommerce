import { sanitizeHtml } from "~/lib/sanitize-html";

type SafeHTMLProps = {
	/**
	 * The HTML content to sanitize and render
	 */
	html: string;
	/**
	 * Optional className for the wrapper element
	 */
	className?: string;
	/**
	 * Optional tag name for the wrapper element (default: 'div')
	 */
	as?: keyof JSX.IntrinsicElements;
	/**
	 * Whether to allow additional HTML tags beyond the default safe set
	 * When true, uses a more permissive sanitization config
	 */
	allowMoreTags?: boolean;
};

/**
 * Component for safely rendering HTML content
 * Automatically sanitizes HTML to prevent XSS attacks using DOMPurify
 * 
 * @example
 * ```tsx
 * <SafeHTML html={post.body} className="prose" />
 * ```
 * 
 * @example
 * ```tsx
 * <SafeHTML html={product.description} as="section" />
 * ```
 */
export function SafeHTML({
	html,
	className,
	as: Component = "div",
	allowMoreTags = false,
}: SafeHTMLProps) {
	if (!html) {
		return null;
	}

	const sanitized = sanitizeHtml(html);

	if (!sanitized) {
		return null;
	}

	return (
		<Component
			className={className}
			dangerouslySetInnerHTML={{ __html: sanitized }}
		/>
	);
}










