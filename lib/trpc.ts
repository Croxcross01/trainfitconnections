import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { AppRouter } from '@/backend/trpc/app-router';
import superjson from 'superjson';
import { Platform } from 'react-native';

export const trpc = createTRPCReact<AppRouter>();

// Create a transformer for data serialization
const transformer = superjson;

// Get the appropriate API URL based on platform
const getApiUrl = () => {
  // For web, use relative URL
  if (Platform.OS === 'web') {
    return '/api/trpc';
  }
  
  // For native, use absolute URL (would be configured differently in production)
  return 'http://localhost:3000/api/trpc';
};

// Custom fetch function with size limits and better error handling
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // Check if this is a POST request with a body
  if (init && init.method === 'POST' && init.body) {
    // Get the body size
    const bodySize = init.body instanceof Blob 
      ? init.body.size 
      : typeof init.body === 'string' 
        ? new Blob([init.body]).size 
        : 0;
    
    // If body size is too large (over 8MB), reject the request
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (bodySize > maxSize) {
      console.error(`Request payload too large: ${bodySize} bytes (max: ${maxSize} bytes)`);
      throw new Error(`Payload too large: ${(bodySize / (1024 * 1024)).toFixed(2)}MB exceeds limit of 8MB`);
    }
  }
  
  try {
    // Use platform-specific fetch with timeout
    if (Platform.OS === 'web') {
      // For web, use standard fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        });
        
        // Check for 413 status code
        if (response.status === 413) {
          console.error('413 Payload Too Large error detected');
          throw new Error('Payload too large. Please reduce the size of your request.');
        }
        
        return response;
      } finally {
        clearTimeout(timeoutId);
      }
    } else {
      // For native, use fetch with AbortSignal.timeout if available
      const response = await fetch(input, {
        ...init,
        // Use AbortSignal.timeout if available, otherwise use a controller
        signal: AbortSignal.timeout ? AbortSignal.timeout(30000) : (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 30000);
          return controller.signal;
        })(),
      });
      
      // Check for 413 status code
      if (response.status === 413) {
        console.error('413 Payload Too Large error detected');
        throw new Error('Payload too large. Please reduce the size of your request.');
      }
      
      return response;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Enhance error message for payload size issues
    if (error instanceof Error && 
        (error.message.includes('payload') || 
         error.message.includes('size') || 
         error.message.includes('large'))) {
      throw new Error(`Request payload too large: ${error.message}`);
    }
    
    throw error;
  }
};

// Create a client with better error handling and retry logic
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      transformer,
      // Add fetch options for better timeout handling
      fetch: customFetch,
      // Add headers
      headers: () => {
        return {
          'Content-Type': 'application/json',
          'X-Client-Platform': Platform.OS,
        };
      },
    }),
  ],
});