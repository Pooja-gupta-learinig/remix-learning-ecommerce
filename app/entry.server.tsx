import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { getSecurityHeaders } from "~/lib/security.server";

/**
 * Entry point for server-side rendering
 * Applies security headers to all responses
 * 
 * This function is called by React Router v7 for every server-rendered request
 */
export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	routerContext: EntryContext
) {
	// Get security headers
	const securityHeaders = getSecurityHeaders();

	// Apply security headers to response
	for (const [key, value] of Object.entries(securityHeaders)) {
		if (value) {
			responseHeaders.set(key, value);
		}
	}

	// Remove X-Powered-By header if present (security best practice)
	responseHeaders.delete("X-Powered-By");

	// Determine if this is a bot request (for SEO optimization)
	const userAgent = request.headers.get("user-agent");
	const isBotRequest = userAgent ? isbot(userAgent) : false;

	// Render the app to a readable stream
	const body = await renderToReadableStream(
		<ServerRouter context={routerContext} url={request.url} />,
		{
			signal: request.signal,
			onError(error: unknown) {
				// Log error but don't crash the server
				console.error("SSR Error:", error);
				responseStatusCode = 500;
			},
		}
	);

	// Wait for initial render for bots (better SEO)
	if (isBotRequest) {
		await body.allReady;
	}

	return new Response(body, {
		headers: responseHeaders,
		status: responseStatusCode,
	});
}

