import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, MessageThread, Reminder } from '@/types';
import { useAuthStore } from './auth-store';
import { trpcClient } from '@/lib/trpc';

interface MessageState {
  threads: MessageThread[];
  messages: Message[];
  messageNotifications: Reminder[];
  isLoading: boolean;
  error: string | null;
  hasUnreadMessages: boolean;
  
  // Actions
  fetchThreads: () => Promise<void>;
  fetchMessages: (threadId?: string, recipientId?: string) => Promise<void>;
  sendMessage: (messageData: { content: string; recipientId: string; threadId?: string }) => Promise<void>;
  markThreadAsRead: (threadId: string) => void;
  markMessageNotificationAsRead: (notificationId: string) => void;
  deleteThread: (threadId: string) => void;
}

// Mock message notifications
const mockMessageNotifications: Reminder[] = [
  {
    id: 'mn1',
    trainerId: 't1',
    clientId: 'c1',
    title: 'New Message',
    message: "Emma Wilson: Thanks for the workout plan! I'll start tomorrow.",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    isRead: false,
    type: 'message',
    relatedId: 'thread1',
    senderId: 'c1',
    senderName: 'Emma Wilson',
    senderImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
  },
];

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      threads: [],
      messages: [],
      messageNotifications: mockMessageNotifications,
      isLoading: false,
      error: null,
      hasUnreadMessages: false,
      
      fetchThreads: async () => {
        set({ isLoading: true, error: null });
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          // Fetch threads from the backend
          const result = await trpcClient.messages.getThreads.query();
          
          if (!result) {
            throw new Error('Invalid response from server');
          }
          
          set({ 
            threads: result.threads || [],
            hasUnreadMessages: result.hasUnreadMessages || false,
            isLoading: false 
          });
          
          return Promise.resolve();
        } catch (error) {
          console.error('Error fetching threads:', error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch message threads", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      fetchMessages: async (threadId, recipientId) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          // Fetch messages from the backend
          const result = await trpcClient.messages.getMessages.query({
            threadId,
            recipientId,
          });
          
          if (!result) {
            throw new Error('Invalid response from server');
          }
          
          set({ 
            messages: result.messages || [],
            isLoading: false 
          });
          
          // If we have a threadId, mark it as read
          if (result.threadId) {
            get().markThreadAsRead(result.threadId);
          }
          
          return Promise.resolve();
        } catch (error) {
          console.error('Error fetching messages:', error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch messages", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      sendMessage: async ({ content, recipientId, threadId }) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = useAuthStore.getState();
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          // Send message to the backend
          const result = await trpcClient.messages.sendMessage.mutate({
            content,
            recipientId,
            threadId,
          });
          
          if (!result) {
            throw new Error('Invalid response from server');
          }
          
          // Update messages
          if (result.message) {
            set(state => ({
              messages: [...state.messages, result.message],
            }));
          }
          
          // Update threads
          if (result.threadId) {
            const existingThreadIndex = get().threads.findIndex(t => t.id === result.threadId);
            
            if (existingThreadIndex >= 0 && result.message) {
              // Update existing thread
              set(state => ({
                threads: state.threads.map(thread => 
                  thread.id === result.threadId 
                    ? { 
                        ...thread, 
                        lastMessage: result.message,
                        unreadCount: 0, // Reset unread count for sender
                      } 
                    : thread
                ),
              }));
            } else if (result.thread) {
              // Add new thread
              set(state => ({
                threads: [...state.threads, result.thread],
              }));
            }
          }
          
          // Create notification for recipient
          const notificationId = `mn${Date.now()}`;
          const newNotification: Reminder = {
            id: notificationId,
            trainerId: user.role === 'trainer' ? user.id : recipientId,
            clientId: user.role === 'client' ? user.id : recipientId,
            title: 'New Message',
            message: `${user.name}: ${content}`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'message',
            relatedId: result.threadId || '',
            senderId: user.id,
            senderName: user.name,
            senderImage: user.profilePicture || '',
          };
          
          // In a real app, this notification would be sent to the recipient via an API
          // For demo, we'll just add it to our own notifications
          set(state => ({
            messageNotifications: [...state.messageNotifications, newNotification],
            isLoading: false,
          }));
          
          return Promise.resolve();
        } catch (error) {
          console.error('Error sending message:', error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to send message",
            isLoading: false,
          });
          return Promise.reject(error);
        }
      },
      
      markThreadAsRead: (threadId) => {
        try {
          // Mark thread as read in the backend
          trpcClient.messages.markAsRead.mutate({ threadId })
            .catch(error => {
              console.error('Error marking thread as read:', error);
            });
          
          set(state => {
            // Mark all messages in this thread as read
            const updatedMessages = state.messages.map(message => 
              message.receiverId === useAuthStore.getState().user?.id
                ? { ...message, isRead: true }
                : message
            );
            
            // Update thread's unread count and last message read status
            const updatedThreads = state.threads.map(thread => 
              thread.id === threadId
                ? { 
                    ...thread, 
                    unreadCount: 0,
                    lastMessage: thread.lastMessage ? {
                      ...thread.lastMessage,
                      isRead: true
                    } : thread.lastMessage
                  }
                : thread
            );
            
            // Update hasUnreadMessages flag
            const hasUnread = updatedThreads.some(thread => 
              thread.participants.includes(useAuthStore.getState().user?.id || '') && 
              thread.lastMessage && 
              thread.lastMessage.senderId !== useAuthStore.getState().user?.id && 
              !thread.lastMessage.isRead
            );
            
            return {
              messages: updatedMessages,
              threads: updatedThreads,
              hasUnreadMessages: hasUnread,
            };
          });
        } catch (error) {
          console.error('Error marking thread as read:', error);
        }
      },
      
      markMessageNotificationAsRead: (notificationId) => {
        set(state => ({
          messageNotifications: state.messageNotifications.map(notification => 
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
        }));
      },
      
      deleteThread: (threadId) => {
        set(state => ({
          threads: state.threads.filter(thread => thread.id !== threadId),
          // Also remove messages for this thread
          messages: state.messages.filter(message => {
            const thread = state.threads.find(t => t.id === threadId);
            if (!thread) return true;
            return !(
              thread.participants.includes(message.senderId) && 
              thread.participants.includes(message.receiverId)
            );
          }),
        }));
      },
    }),
    {
      name: 'message-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);