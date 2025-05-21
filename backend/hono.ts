import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/trpc";

const app = new Hono();

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    maxAge: 86400,
  })
);

// Add request size limit middleware - IMPROVED ERROR HANDLING
app.use("*", async (c, next) => {
  const contentLength = c.req.header('content-length');
  
  // If content length is provided, check if it exceeds the limit (10MB)
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (size > maxSize) {
      console.error(`Request payload too large: ${size} bytes (max: ${maxSize} bytes)`);
      return c.json(
        { 
          error: "Payload too large", 
          message: "The request payload exceeds the maximum allowed size of 10MB.",
          details: {
            requestSize: `${(size / (1024 * 1024)).toFixed(2)}MB`,
            maxAllowedSize: "10MB"
          }
        }, 
        413
      );
    }
  }
  
  try {
    await next();
  } catch (error) {
    // Check if the error is related to payload size
    if (error instanceof Error && 
        (error.message.includes('payload') || 
         error.message.includes('size') || 
         error.message.includes('large'))) {
      console.error('Payload size error:', error);
      return c.json(
        { 
          error: "Payload too large", 
          message: error.message || "The request payload is too large.",
          details: {
            maxAllowedSize: "10MB"
          }
        }, 
        413
      );
    }
    
    // Re-throw other errors
    throw error;
  }
});

// Add request timeout handling
app.use("*", async (c, next) => {
  try {
    // Set a timeout for the request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 25000); // 25 second timeout
    });

    // Race the request against the timeout
    await Promise.race([next(), timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message === "Request timeout") {
      return c.json({ error: "Request timeout" }, 504);
    }
    throw error;
  }
});

// Mount tRPC router using trpcServer middleware
app.use("/api/trpc/*", trpcServer({
  router: appRouter,
  createContext,
  onError: (opts) => {
    const { error, type, path, input, ctx, req } = opts;
    console.error(`Error in tRPC handler: ${path}`, {
      type,
      input,
      error: error.message,
      stack: error.stack,
    });
    
    // Check if the error is related to payload size
    if (error.message.includes("payload") || 
        error.message.includes("size") || 
        error.message.includes("large")) {
      return {
        message: `Payload too large: ${error.message}`,
        code: "PAYLOAD_TOO_LARGE",
      };
    }
    
    // Return a more helpful error message
    return {
      message: `An error occurred: ${error.message}`,
      code: "INTERNAL_SERVER_ERROR",
    };
  },
}));

// Add a simple health check endpoint
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Add a catch-all route for debugging
app.all("*", (c) => {
  const method = c.req.method;
  const path = c.req.path;
  const headers = Object.fromEntries([...c.req.raw.headers.entries()]);
  
  console.log(`Unhandled request: ${method} ${path}`);
  console.log("Headers:", headers);
  
  return c.json({
    error: "Not found",
    message: `No handler for ${method} ${path}`,
    requestInfo: {
      method,
      path,
      headers: {
        ...headers,
        // Remove sensitive headers
        authorization: headers.authorization ? "[REDACTED]" : undefined,
        cookie: headers.cookie ? "[REDACTED]" : undefined,
      }
    }
  }, 404);
});