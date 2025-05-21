import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

// Define a schema for the input
const getMessagesSchema = z.object({
  threadId: z.string(),
  limit: z.number().optional(),
  cursor: z.string().optional(),
});

// Mock messages data
const mockMessages = [
  {
    id: 'm1',
    threadId: 't1',
    senderId: 't1',
    senderName: 'John Trainer',
    senderRole: 'trainer',
    senderImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
    content: 'Hi there! How can I help you with your fitness goals today?',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: 'm2',
    threadId: 't1',
    senderId: 'c1',
    senderName: 'Sarah Client',
    senderRole: 'client',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
    content: "I'm looking to improve my strength training routine. Can you suggest some exercises?",
    timestamp: new Date(Date.now() - 82800000).toISOString(), // 23 hours ago
    read: true,
  },
  {
    id: 'm3',
    threadId: 't1',
    senderId: 't1',
    senderName: 'John Trainer',
    senderRole: 'trainer',
    senderImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
    content: 'Absolutely! Based on your profile, I would recommend starting with compound movements like squats, deadlifts, and bench press. How many days per week can you commit to training?',
    timestamp: new Date(Date.now() - 79200000).toISOString(), // 22 hours ago
    read: true,
  },
  {
    id: 'm4',
    threadId: 't1',
    senderId: 'c1',
    senderName: 'Sarah Client',
    senderRole: 'client',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
    content: 'I can commit to 3-4 days per week. I prefer morning workouts if possible.',
    timestamp: new Date(Date.now() - 75600000).toISOString(), // 21 hours ago
    read: true,
  },
  {
    id: 'm5',
    threadId: 't1',
    senderId: 't1',
    senderName: 'John Trainer',
    senderRole: 'trainer',
    senderImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
    content: "That's perfect! I'll create a 4-day split program for you focusing on different muscle groups. Would you like to schedule a session to go through the proper form for these exercises?",
    timestamp: new Date(Date.now() - 72000000).toISOString(), // 20 hours ago
    read: true,
  },
  {
    id: 'm6',
    threadId: 't1',
    senderId: 'c1',
    senderName: 'Sarah Client',
    senderRole: 'client',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
    content: 'Yes, that would be great! I have availability next Tuesday or Thursday morning.',
    timestamp: new Date(Date.now() - 68400000).toISOString(), // 19 hours ago
    read: true,
  },
  {
    id: 'm7',
    threadId: 't1',
    senderId: 't1',
    senderName: 'John Trainer',
    senderRole: 'trainer',
    senderImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
    content: "Let's go with Thursday at 9 AM. I'll send you a calendar invite. In the meantime, I'll prepare your workout plan and send it over by tomorrow.",
    timestamp: new Date(Date.now() - 64800000).toISOString(), // 18 hours ago
    read: true,
  },
  {
    id: 'm8',
    threadId: 't1',
    senderId: 'c1',
    senderName: 'Sarah Client',
    senderRole: 'client',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
    content: 'Sounds great! Looking forward to it. Thank you!',
    timestamp: new Date(Date.now() - 61200000).toISOString(), // 17 hours ago
    read: true,
  },
  {
    id: 'm9',
    threadId: 't1',
    senderId: 't1',
    senderName: 'John Trainer',
    senderRole: 'trainer',
    senderImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
    content: "I've just sent over your workout plan. Take a look and let me know if you have any questions before our session on Thursday.",
    timestamp: new Date(Date.now() - 36000000).toISOString(), // 10 hours ago
    read: true,
  },
  {
    id: 'm10',
    threadId: 't1',
    senderId: 'c1',
    senderName: 'Sarah Client',
    senderRole: 'client',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
    content: "Just reviewed the plan - it looks challenging but doable! I'm a bit concerned about the deadlifts as I've had lower back issues in the past. Can we discuss modifications?",
    timestamp: new Date(Date.now() - 32400000).toISOString(), // 9 hours ago
    read: true,
  },
  {
    id: 'm11',
    threadId: 't1',
    senderId: 't1',
    senderName: 'John Trainer',
    senderRole: 'trainer',
    senderImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
    content: "Absolutely! Thanks for letting me know about your back issues. We can definitely modify the deadlifts or substitute with alternative exercises. I'll make a note to focus on this during our session and show you proper form to protect your back.",
    timestamp: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
    read: true,
  },
  {
    id: 'm12',
    threadId: 't1',
    senderId: 'c1',
    senderName: 'Sarah Client',
    senderRole: 'client',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
    content: 'Perfect! That makes me feel much better. See you Thursday!',
    timestamp: new Date(Date.now() - 25200000).toISOString(), // 7 hours ago
    read: true,
  },
];

const getMessagesProcedure = protectedProcedure
  .input(getMessagesSchema)
  .query(async ({ ctx, input }) => {
    // In a real app, you would fetch messages from a database
    // For demo purposes, we'll just return mock data
    
    // Filter messages by threadId
    const messages = mockMessages.filter(message => message.threadId === input.threadId);
    
    // Sort messages by timestamp (oldest first)
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Apply pagination if cursor is provided
    let filteredMessages = messages;
    if (input.cursor) {
      const cursorIndex = messages.findIndex(message => message.id === input.cursor);
      if (cursorIndex !== -1) {
        filteredMessages = messages.slice(cursorIndex + 1);
      }
    }
    
    // Apply limit if provided
    if (input.limit) {
      filteredMessages = filteredMessages.slice(0, input.limit);
    }
    
    return {
      messages: filteredMessages,
      nextCursor: null, // In a real app, you would return the ID of the last message if there are more
    };
  });

export default getMessagesProcedure;