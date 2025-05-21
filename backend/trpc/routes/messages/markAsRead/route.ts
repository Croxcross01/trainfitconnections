import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

const markAsReadProcedure = protectedProcedure
  .input(
    z.object({
      messageIds: z.array(z.string()),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // In a real app, this would update the read status in a database
    // For demo purposes, we'll just return a mock response
    
    return {
      success: true,
      markedCount: input.messageIds.length,
    };
  });

export default markAsReadProcedure;