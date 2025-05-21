import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useMessageStore } from '@/store/message-store';
import { MessageThread } from '@/types';
import Colors from '@/constants/colors';
import { ArrowLeft } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { threads, fetchThreads, isLoading: storeLoading, error: storeError } = useMessageStore();
  const [loading, setLoading] = useState(true);
  
  // Use tRPC query for real-time updates
  const { 
    data: threadsData, 
    refetch: refetchThreads, 
    isLoading: isThreadsLoading, 
    error: threadsError 
  } = trpc.messages.getThreads.useQuery(
    undefined,
    {
      enabled: !!user,
    }
  );
  
  // Handle successful threads fetch
  useEffect(() => {
    if (threadsData) {
      console.log('Threads fetched successfully:', threadsData.threads?.length || 0);
    }
  }, [threadsData]);
  
  // Show error if tRPC query has an error
  useEffect(() => {
    if (threadsError) {
      console.error('tRPC threads error:', threadsError);
      Alert.alert('Error', 'Failed to load message threads. Please try again.');
    }
  }, [threadsError]);
  
  // Show error if store has an error
  useEffect(() => {
    if (storeError) {
      Alert.alert('Error', storeError);
    }
  }, [storeError]);
  
  // Fetch threads
  useEffect(() => {
    const loadThreads = async () => {
      try {
        await fetchThreads();
      } catch (error) {
        console.error('Failed to fetch threads:', error);
        // Don't show alert here, as it might be redundant with the tRPC error
      } finally {
        setLoading(false);
      }
    };
    
    loadThreads();
    
    // Set up polling for new threads (every 15 seconds)
    const intervalId = setInterval(() => {
      refetchThreads().catch(err => console.error('Error refetching threads:', err));
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [fetchThreads, refetchThreads]);
  
  const handleThreadPress = (thread: MessageThread) => {
    router.push({
      pathname: '/messages/chat',
      params: {
        threadId: thread.id,
        recipientId: thread.recipientInfo.id,
        recipientName: thread.recipientInfo.name,
        recipientImage: thread.recipientInfo.profileImage,
      },
    });
  };

  const handleGoBack = () => {
    router.back();
  };
  
  const renderThreadItem = ({ item }: { item: MessageThread }) => {
    if (!item || !item.lastMessage) {
      console.error('Invalid thread item:', item);
      return null;
    }
    
    // Format timestamp
    const messageDate = new Date(item.lastMessage.timestamp);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    let timeString;
    if (isToday) {
      timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      timeString = messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.threadItem,
          item.unreadCount > 0 && styles.unreadThread
        ]}
        onPress={() => handleThreadPress(item)}
      >
        <Image
          source={{ uri: item.recipientInfo.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000' }}
          style={styles.avatar}
        />
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text style={styles.recipientName}>{item.recipientInfo.name}</Text>
            <Text style={styles.timestamp}>{timeString}</Text>
          </View>
          <View style={styles.messagePreviewContainer}>
            <Text 
              style={[
                styles.messagePreview,
                item.unreadCount > 0 && styles.unreadMessagePreview
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.lastMessage.content}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Determine if we're still loading
  const isStillLoading = loading || storeLoading || isThreadsLoading;
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Messages',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {isStillLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          renderItem={renderThreadItem}
          contentContainerStyle={styles.threadList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet.</Text>
              <Text style={styles.emptySubtext}>
                Start a conversation by messaging a trainer or client.
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
  },
  threadList: {
    paddingVertical: 8,
  },
  threadItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.darker,
  },
  unreadThread: {
    backgroundColor: Colors.background.darker + '40', // 25% opacity
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  threadContent: {
    flex: 1,
    justifyContent: 'center',
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  unreadMessagePreview: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});