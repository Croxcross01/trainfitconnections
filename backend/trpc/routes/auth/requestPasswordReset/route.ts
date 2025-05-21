import { publicProcedure } from '../../../trpc';
import { z } from 'zod';

const requestPasswordResetProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // In a real app, this would:
      // 1. Check if the email exists in the database
      // 2. Generate a token and store it with an expiry
      // 3. Send an email with a reset link
      
      // For demo purposes, we'll just return success
      return {
        success: true,
        message: "If an account with that email exists, a password reset link has been sent."
      };
    } catch (error) {
      throw new Error("Failed to process password reset request");
    }
  });

export default requestPasswordResetProcedure;