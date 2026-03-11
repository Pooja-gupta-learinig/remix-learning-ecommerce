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

// Export handler that lazily initializes
// Vercel passes Web Request directly to serverless functions
export default async (request) => {
  const handler = await getHandler();
  return handler(request);
};

