import pkg from "@react-router/node";
const { createRequestHandler } = pkg;

// Create error handler for initialization failures
function createErrorHandler(error) {
  return async (request) => {
    console.error("Server initialization error:", error);
    
    // Check for common issues
    const isProduction = process.env.NODE_ENV === "production";
    const missingSessionSecret = isProduction && !process.env.SESSION_SECRET;
    
    if (missingSessionSecret) {
      return new Response(
        JSON.stringify({
          error: "Server Configuration Error",
          message: "Missing required environment variable: SESSION_SECRET",
          hint: "Please set SESSION_SECRET in your Vercel environment variables. It must be at least 16 characters long.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        error: "Server Initialization Error",
        message: error?.message || "Unknown error during server initialization",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  };
}

// Lazy initialization - only load build when handler is first called
let handlerPromise = null;
let handlerError = null;

async function getHandler() {
  if (handlerError) {
    return createErrorHandler(handlerError);
  }
  
  if (handlerPromise) {
    return handlerPromise;
  }
  
  handlerPromise = (async () => {
    try {
      const build = await import("../build/server/index.js");
      return createRequestHandler({
        build,
        mode: process.env.NODE_ENV || "production",
      });
    } catch (error) {
      handlerError = error;
      console.error("Failed to initialize server:", error);
      return createErrorHandler(error);
    }
  })();
  
  return handlerPromise;
}

// Convert Vercel's Node.js request to Web Request
function createWebRequest(req) {
  const protocol = req.headers?.['x-forwarded-proto'] || 'https';
  const host = req.headers?.['x-forwarded-host'] || req.headers?.host || 'localhost';
  const path = req.url || '/';
  const url = path.startsWith('http') ? path : `${protocol}://${host}${path}`;
  
  // Get body
  let body = null;
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.body) {
      if (typeof req.body === 'string') {
        body = req.body;
      } else if (Buffer.isBuffer(req.body)) {
        body = req.body;
      } else {
        body = JSON.stringify(req.body);
      }
    }
  }
  
  // Build headers
  const headers = new Headers();
  if (req.headers) {
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, String(v)));
        } else {
          headers.set(key, String(value));
        }
      }
    }
  }
  
  return new Request(url, {
    method: req.method || 'GET',
    headers,
    body,
  });
}

// Convert Web Response to Vercel response
async function sendVercelResponse(response, res) {
  res.status(response.status);
  
  // Copy headers
  response.headers.forEach((value, key) => {
    // Skip transfer-encoding as Vercel handles it
    if (key.toLowerCase() !== 'transfer-encoding') {
      res.setHeader(key, value);
    }
  });
  
  // Get body and send
  const body = await response.text();
  res.send(body);
}

// Export handler for Vercel serverless functions
export default async function handler(req, res) {
  try {
    const handler = await getHandler();
    
    // Convert Vercel request to Web Request
    const webRequest = createWebRequest(req);
    
    // Handle request
    const response = await handler(webRequest);
    
    // Convert response to Vercel format
    await sendVercelResponse(response, res);
  } catch (error) {
    console.error("Request handling error:", error);
    console.error("Error stack:", error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  }
}
