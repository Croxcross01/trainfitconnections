import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

const getThreadsProcedure = protectedProcedure
  .input(
    z.object({
      limit: z.number().optional().default(10),
      cursor: z.string().optional(),
    }).optional()
  )
  .query(async ({ ctx, input }) => {
    // Mock data for message threads
    const threads = [
      {
        id: '1',
        participantId: 'c1',
        participantName: 'Sarah Johnson',
        participantRole: 'client',
        participantImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
        lastMessage: 'Are we still on for tomorrow?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        unreadCount: 2,
      },
      {
        id: '2',
        participantId: 'c2',
        participantName: 'Michael Chen',
        participantRole: 'client',
        participantImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000',
        lastMessage: 'Thanks for the workout plan!',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        unreadCount: 0,
      },
      {
        id: '3',
        participantId: 't2',
        participantName: 'Emma Trainer',
        participantRole: 'trainer',
        participantImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000',
        lastMessage: 'I have a new HIIT routine you might like',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        unreadCount: 1,
      },
    ];

    return {
      threads,
      nextCursor: null, // For pagination
    };
  });

export default getThreadsProcedure;