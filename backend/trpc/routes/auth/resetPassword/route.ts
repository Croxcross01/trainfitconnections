import { publicProcedure } from '../../../trpc';
import { z } from 'zod';

const resetPasswordProcedure = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      token: z.string(),
      newPassword: z.string().min(6),
    })
  )
  .mutation(async ({ input }) => {
    try {
      // In a real app, this would:
      // 1. Verify the token is valid and not expired
      // 2. Update the user's password in the database
      // 3. Invalidate the token
      
      // For demo purposes, we'll just return success
      return {
        success: true,
        message: "Password has been reset successfully."
      };
    } catch (error) {
      throw new Error("Failed to reset password");
    }
  });

export default resetPasswordProcedure;