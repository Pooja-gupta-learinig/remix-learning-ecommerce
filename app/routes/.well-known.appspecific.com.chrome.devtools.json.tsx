/**
 * @file Resource route for Chrome DevTools well-known path
 * This route handles Chrome DevTools requests to prevent route matching errors
 */

export async function loader() {
	// Return empty JSON response for Chrome DevTools
	return new Response(JSON.stringify({}), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

