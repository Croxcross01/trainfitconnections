import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

// Create context type with optional user property
export type Context = {
  user?: {
    id: string;
    name: string;
    role: string;
  } | null;
};

// Create context function for use in the server
export const createContext = (): Context => {
  return {
    user: {
      id: 't1', // Mock user ID for testing
      name: 'John Trainer',
      role: 'trainer',
    }, // In a real app, you would get the user from the request
  };
};

// Create a new instance of tRPC with improved error handling
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // Log the error for debugging
    console.error('TRPC Error:', error);
    
    // Check if the error is related to payload size
    if (
      error.message.includes('payload') || 
      error.message.includes('size') || 
      error.message.includes('large')
    ) {
      return {
        ...shape,
        data: {
          ...shape.data,
          httpStatus: 413,
          code: 'PAYLOAD_TOO_LARGE',
          message: error.message,
        },
      };
    }
    
    return {
      ...shape,
      data: {
        ...shape.data,
        message: error.message,
      },
    };
  },
});

// Export the transformer for client use
export const transformer = superjson;

// Export the router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Create a middleware for protected routes
const isAuthed = t.middleware(({ next, ctx }) => {
  // In a real app, you would check if the user is authenticated
  // For now, we'll just pass through
  return next({
    ctx: {
      // Add user info to the context if needed
      user: ctx.user || {
        id: 't1', // Mock user ID for testing
        name: 'John Trainer',
        role: 'trainer',
      },
    },
  });
});

// Export the protected procedure
export const protectedProcedure = t.procedure.use(isAuthed);