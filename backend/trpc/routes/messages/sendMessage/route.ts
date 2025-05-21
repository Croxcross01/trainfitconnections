import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// Define a more strict input schema with better validation
const sendMessageSchema = z.object({
  threadId: z.string().optional(),
  content: z.string()
    .min(1, "Message content cannot be empty")
    .max(5000, "Message content exceeds maximum length of 5000 characters"),
  recipientId: z.string().min(1, "Recipient ID is required"),
});

const sendMessageProcedure = protectedProcedure
  .input(sendMessageSchema)
  .mutation(async ({ ctx, input }) => {
    // Check payload size
    const payloadSize = JSON.stringify(input).length;
    const maxPayloadSize = 1 * 1024 * 1024; // 1MB for messages
    
    if (payloadSize > maxPayloadSize) {
      console.error(`Message payload too large: ${payloadSize} bytes (max: ${maxPayloadSize} bytes)`);
      throw new Error(`Message payload too large: ${(payloadSize / (1024 * 1024)).toFixed(2)}MB exceeds limit of 1MB`);
    }
    
    // In a real app, this would save the message to a database
    // For demo purposes, we'll just return a mock response
    
    const newMessage = {
      id: Math.random().toString(36).substring(2, 11),
      threadId: input.threadId || Math.random().toString(36).substring(2, 11),
      senderId: ctx.user?.id || 't1',
      senderName: ctx.user?.name || 'John Trainer',
      senderRole: ctx.user?.role || 'trainer',
      // The user object doesn't have profileImage property, so we use a default image
      senderImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
      content: input.content,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    return {
      success: true,
      message: newMessage,
    };
  });

export default sendMessageProcedure;