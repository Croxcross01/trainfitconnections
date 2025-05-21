import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { useTrainerStore } from '@/store/trainer-store';
import { useMessageStore } from '@/store/message-store';
import { ReminderCard } from '@/components/ReminderCard';
import { Reminder } from '@/types';
import Colors from '@/constants/colors';
import { layout } from '@/styles/layout';
import { typography } from '@/styles/typography';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { reminders: clientReminders, markReminderAsRead: markClientReminderAsRead, getReminders: getClientReminders } = useClientStore();
  const { 
    reminders: trainerReminders, 
    markReminderAsRead: markTrainerReminderAsRead,
    acceptSession,
    declineSession,
    clients,
    sessions,
    scheduleSession
  } = useTrainerStore();
  const { messageNotifications, markMessageNotificationAsRead } = useMessageStore();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Load reminders on mount and when dependencies change
  useEffect(() => {
    console.log("NotificationsScreen: useEffect triggered");
    loadReminders();
  }, [user, clientReminders, trainerReminders, messageNotifications]);
  
  const loadReminders = () => {
    setLoading(true);
    try {
      // Determine which reminders to show based on user role
      if (user?.role === 'trainer') {
        console.log(`Trainer reminders count: ${trainerReminders.length}`);
        console.log(`Message notifications count: ${messageNotifications.length}`);
        
        // Debug log to see what's in the trainer reminders
        if (trainerReminders.length > 0) {
          console.log("First few trainer reminders:", trainerReminders.slice(0, 3).map(r => ({ 
            id: r.id, 
            type: r.type, 
            title: r.title,
            isRead: r.isRead,
            relatedId: r.relatedId // Log the relatedId for debugging
          })));
        } else {
          console.log("No trainer reminders found");
        }
        
        // Combine trainer reminders with message notifications
        const combinedReminders = [...trainerReminders, ...messageNotifications];
        
        // Sort reminders by date (newest first)
        const sortedReminders = [...combinedReminders].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        console.log(`Total combined reminders after sorting: ${sortedReminders.length}`);
        
        // Set the reminders state
        setReminders(sortedReminders);
      } else {
        // Combine client reminders with message notifications
        const combinedReminders = [...clientReminders, ...messageNotifications];
        
        // Sort reminders by date (newest first)
        const sortedReminders = [...combinedReminders].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setReminders(sortedReminders);
        console.log(`Loaded ${clientReminders.length} client reminders and ${messageNotifications.length} message notifications`);
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // In a real app, we would fetch fresh data from the server
      if (user?.role === 'client') {
        await getClientReminders();
      }
      
      // For trainers, we'll just re-sort the existing reminders
      if (user?.role === 'trainer') {
        console.log(`Refreshed: ${trainerReminders.length} trainer reminders`);
        
        // Debug alert to show trainer reminders
        if (trainerReminders.length > 0) {
          Alert.alert(
            "Debug: Trainer Reminders",
            `You have ${trainerReminders.length} notifications.

Types: ${trainerReminders.map(r => r.type).join(', ')}`,
            [{ text: "OK" }]
          );
        } else {
          Alert.alert(
            "Debug: No Reminders",
            "You don't have any notifications yet.",
            [{ text: "OK" }]
          );
        }
      }
      
      // Reload reminders
      loadReminders();
    } catch (error) {
      console.error('Error refreshing reminders:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user, trainerReminders, clientReminders, messageNotifications]);
  
  const handleReminderPress = (reminder: Reminder) => {
    // Check if this is a non-interactive notification (tip or general update)
    if (reminder.type === 'tip' || reminder.type === 'general_update') {
      // Just mark as read but don't navigate
      if (!reminder.isRead) {
        if (user?.role === 'trainer') {
          markTrainerReminderAsRead(reminder.id);
        } else {
          markClientReminderAsRead(reminder.id);
        }
        
        // Update the local state to show the reminder as read
        setReminders(prevReminders => 
          prevReminders.map(r => 
            r.id === reminder.id ? { ...r, isRead: true } : r
          )
        );
      }
      
      // Show the content in an alert instead of navigating
      Alert.alert(
        reminder.title,
        reminder.message,
        [{ text: "OK" }]
      );
      
      return;
    }
    
    // Mark as read
    if (!reminder.isRead) {
      if (reminder.type === 'message') {
        markMessageNotificationAsRead(reminder.id);
      } else if (user?.role === 'trainer') {
        markTrainerReminderAsRead(reminder.id);
      } else {
        markClientReminderAsRead(reminder.id);
      }
      
      // Update the local state to show the reminder as read
      setReminders(prevReminders => 
        prevReminders.map(r => 
          r.id === reminder.id ? { ...r, isRead: true } : r
        )
      );
    }
    
    // Handle session request notifications for trainers
    if (user?.role === 'trainer' && reminder.type === 'session_request' && reminder.relatedId) {
      console.log(`Session request notification pressed. Related ID: ${reminder.relatedId}`);
      
      // Check if this is a new client
      const isNewClient = reminder.clientId ? !clients.some(c => c.id === reminder.clientId && (c.sessionCount ?? 0) > 0) : false;
      
      // Find the session in the store
      const session = sessions.find(s => s.id === reminder.relatedId);
      
      if (!session) {
        console.log(`Session with ID ${reminder.relatedId} not found in store. This might be a new client request.`);
        
        // For new clients, we need to create a session based on the notification data
        if (isNewClient && reminder.clientId) {
          // Extract session details from the reminder message
          // Example message format: "Emma Wilson has requested a one-on-one session on Monday, June 10 at 10:00."
          const message = reminder.message;
          
          // Parse the message to extract session details
          let sessionType = 'one-on-one'; // Default
          let sessionDate = new Date(); // Default to today
          let startTime = '10:00'; // Default
          let endTime = '11:00'; // Default (1 hour session)
          
          // Try to extract session type
          if (message.includes('one-on-one')) {
            sessionType = 'one-on-one';
          } else if (message.includes('virtual')) {
            sessionType = 'virtual';
          } else if (message.includes('group')) {
            sessionType = 'group';
          } else if (message.includes('house-call')) {
            sessionType = 'house-call';
          }
          
          // Try to extract date and time
          const timeMatch = message.match(/at (\d{1,2}:\d{2})/);
          if (timeMatch && timeMatch[1]) {
            startTime = timeMatch[1];
            
            // Calculate end time (1 hour later)
            const [hours, minutes] = startTime.split(':').map(Number);
            const endHour = (hours + 1) % 24;
            endTime = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
          
          // Create a new session
          const newSession = {
            trainerId: user.id,
            clientId: reminder.clientId,
            date: sessionDate.toISOString(),
            startTime,
            endTime,
            status: 'pending' as const,
            type: sessionType as 'one-on-one' | 'group' | 'virtual' | 'house-call' | 'in-person',
            notes: `Session requested by client. Created from notification.`,
            cost: 75, // Default cost
            paymentStatus: 'pending' as const,
            paymentMethod: 'credit_card' as const
          };
          
          // Schedule the session
          const createdSession = scheduleSession(newSession);
          console.log(`Created new session for new client:`, createdSession);
          
          // Now we can proceed with the acceptance flow using the created session ID
          Alert.alert(
            isNewClient ? 'New Client Session Request' : 'Session Request',
            `${isNewClient ? '⭐ NEW CLIENT ⭐\n\n' : ''}${reminder.clientId ? clients.find(c => c.id === reminder.clientId)?.name || 'A client' : 'A client'} has requested a ${sessionType} session.
            
Would you like to accept or decline this session request?`,
            [
              {
                text: 'View Details',
                onPress: () => router.push(`/session/${createdSession.id}`),
                style: 'default',
              },
              {
                text: 'Accept',
                onPress: () => {
                  // Accept the session with the new session ID
                  acceptSession(createdSession.id, isNewClient);
                  
                  Alert.alert(
                    'Success', 
                    `Session request accepted. ${isNewClient ? 'This new client has' : 'The client has'} been notified and the session has been added to your schedule.`,
                    [
                      {
                        text: 'View Schedule',
                        onPress: () => router.push('/(tabs)/schedule'),
                      },
                      {
                        text: 'OK',
                        onPress: () => {
                          // Refresh the reminders list
                          onRefresh();
                        }
                      }
                    ]
                  );
                },
                style: 'default',
              },
              {
                text: 'Decline',
                onPress: () => {
                  // Ask for reason
                  Alert.prompt(
                    'Decline Session',
                    'Please provide a reason for declining (optional):',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Decline',
                        onPress: (reason) => {
                          declineSession(createdSession.id, reason || undefined);
                          Alert.alert('Success', 'Session request declined. The client has been notified.');
                          // Refresh the reminders list
                          onRefresh();
                        },
                      },
                    ],
                    'plain-text'
                  );
                },
                style: 'destructive',
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
          return;
        }
        
        Alert.alert(
          'Session Not Found',
          `Could not find session details. This might be a system error.`,
          [
            {
              text: 'Refresh',
              onPress: onRefresh
            },
            {
              text: 'OK'
            }
          ]
        );
        return;
      }
      
      Alert.alert(
        isNewClient ? 'New Client Session Request' : 'Session Request',
        `${isNewClient ? '⭐ NEW CLIENT ⭐\n\n' : ''}${reminder.clientId ? clients.find(c => c.id === reminder.clientId)?.name || 'A client' : 'A client'} has requested a ${session.type} session on ${new Date(session.date).toLocaleDateString()} at ${session.startTime}.
        
Would you like to accept or decline this session request?`,
        [
          {
            text: 'View Details',
            onPress: () => router.push(`/session/${reminder.relatedId}`),
            style: 'default',
          },
          {
            text: 'Accept',
            onPress: () => {
              // Log the session ID before accepting
              console.log(`Accepting session with ID: ${reminder.relatedId}`);
              
              if (!reminder.relatedId) {
                Alert.alert('Error', 'Session ID is missing. Cannot accept the session.');
                return;
              }
              
              // Accept the session and update the schedule
              acceptSession(reminder.relatedId, isNewClient);
              
              Alert.alert(
                'Success', 
                `Session request accepted. ${isNewClient ? 'This new client has' : 'The client has'} been notified and the session has been added to your schedule.`,
                [
                  {
                    text: 'View Schedule',
                    onPress: () => router.push('/(tabs)/schedule'),
                  },
                  {
                    text: 'OK',
                    onPress: () => {
                      // Refresh the reminders list
                      onRefresh();
                    }
                  }
                ]
              );
            },
            style: 'default',
          },
          {
            text: 'Decline',
            onPress: () => {
              // Ask for reason
              Alert.prompt(
                'Decline Session',
                'Please provide a reason for declining (optional):',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Decline',
                    onPress: (reason) => {
                      if (!reminder.relatedId) {
                        Alert.alert('Error', 'Session ID is missing. Cannot decline the session.');
                        return;
                      }
                      
                      declineSession(reminder.relatedId, reason || undefined);
                      Alert.alert('Success', 'Session request declined. The client has been notified.');
                      // Refresh the reminders list
                      onRefresh();
                    },
                  },
                ],
                'plain-text'
              );
            },
            style: 'destructive',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }
    
    // Navigate based on notification type
    if (reminder.type === 'message' && reminder.relatedId) {
      // Navigate to the chat with this user
      router.push({
        pathname: '/messages/chat',
        params: { 
          threadId: reminder.relatedId,
          recipientId: reminder.senderId || reminder.clientId,
          recipientName: reminder.senderName || 'Chat',
          recipientImage: reminder.senderImage || '',
        }
      });
    } else if (reminder.type?.includes('session') && reminder.relatedId) {
      router.push(`/session/${reminder.relatedId}`);
    } else if (reminder.type?.includes('workout') && reminder.relatedId) {
      router.push(`/workout/${reminder.relatedId}`);
    } else if (reminder.type?.includes('meal') && reminder.relatedId) {
      router.push(`/meal/${reminder.relatedId}`);
    } else if (reminder.type?.includes('payment') && reminder.relatedId) {
      router.push(`/session/${reminder.relatedId}`);
    } else {
      // Otherwise navigate to the reminder details
      router.push(`/reminder/${reminder.id}`);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }
  
  return (
    <View style={layout.screen}>
      <Text style={styles.title}>Notifications</Text>
      
      {/* Debug button for trainers */}
      {user?.role === 'trainer' && (
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => {
            Alert.alert(
              "Debug: Trainer Notifications",
              `You have ${trainerReminders.length} notifications in your store.

Press Refresh to update the list.`,
              [
                { 
                  text: "Refresh", 
                  onPress: onRefresh 
                },
                { text: "OK" }
              ]
            );
          }}
        >
          <Text style={styles.debugButtonText}>Debug: Check Notifications ({trainerReminders.length})</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            onPress={() => handleReminderPress(item)}
          />
        )}
        contentContainerStyle={styles.reminderList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color={Colors.text.tertiary} style={styles.emptyIcon} />
            <Text style={styles.emptyStateTitle}>No Notifications</Text>
            <Text style={styles.emptyStateText}>
              You don't have any notifications at the moment
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  reminderList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  debugButton: {
    backgroundColor: Colors.background.darker,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  debugButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});