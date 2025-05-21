import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useMessageStore } from '@/store/message-store';
import { Message } from '@/types';
import Colors from '@/constants/colors';
import { Send, ArrowLeft, Info } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { skipToken } from '@tanstack/react-query';

export default function ChatScreen() {
  const { 
    threadId, 
    recipientId, 
    recipientName, 
    recipientImage 
  } = useLocalSearchParams();
  
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    messages, 
    sendMessage, 
    fetchMessages, 
    markThreadAsRead,
    isLoading: storeLoading,
    error: storeError
  } = useMessageStore();
  
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Use tRPC query for real-time updates - Fixed type error by using skipToken when threadId is undefined
  const { 
    data: messagesData, 
    refetch: refetchMessages, 
    isLoading: isMessagesLoading, 
    error: messagesError 
  } = trpc.messages.getMessages.useQuery(
    threadId 
      ? { threadId: threadId as string }  // Remove recipientId as it's not in the expected input type
      : skipToken,
    {
      enabled: !!user && !!threadId,
    }
  );
  
  // Handle successful message fetch
  useEffect(() => {
    if (messagesData) {
      console.log('Messages fetched successfully:', messagesData.messages?.length || 0);
    }
  }, [messagesData]);
  
  // Set the header title to the recipient's name
  useEffect(() => {
    if (recipientName) {
      router.setParams({ title: recipientName as string });
    }
  }, [recipientName, router]);
  
  // Fetch messages for this thread
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (threadId) {
          await fetchMessages(threadId as string);
        } else if (recipientId) {
          // If no threadId, create a new thread or find existing one
          await fetchMessages(undefined, recipientId as string);
        }
        
        // Mark thread as read
        if (threadId) {
          markThreadAsRead(threadId as string);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        // Don't show alert here, as it might be redundant with the tRPC error
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    
    // Set up polling for new messages (every 10 seconds)
    const intervalId = setInterval(() => {
      if (threadId) {
        refetchMessages().catch(err => console.error('Error refetching messages:', err));
      }
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [threadId, recipientId, fetchMessages, markThreadAsRead, refetchMessages]);
  
  // Show error if store has an error
  useEffect(() => {
    if (storeError) {
      Alert.alert('Error', storeError);
    }
  }, [storeError]);
  
  // Show error if tRPC query has an error
  useEffect(() => {
    if (messagesError) {
      console.error('tRPC messages error:', messagesError);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    }
  }, [messagesError]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);
  
  // Use tRPC mutation for sending messages
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      console.log('Message sent successfully');
      // Refetch messages to get the latest
      if (threadId) {
        refetchMessages().catch(err => console.error('Error refetching after send:', err));
      }
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      
      // Check if the error is related to payload size
      if (error.message && 
          (error.message.includes('payload') || 
           error.message.includes('size') || 
           error.message.includes('large'))) {
        Alert.alert('Error', 'Your message is too large. Please shorten it and try again.');
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
      
      // Restore the input text if sending failed
      setInputText(inputText);
    },
    onSettled: () => {
      setSending(false);
    }
  });
  
  const handleSend = async () => {
    if (!inputText.trim() || !user || !recipientId) return;
    if (sending) return;
    
    try {
      // Check message length
      if (inputText.length > 5000) {
        Alert.alert("Message Too Long", "Your message exceeds the maximum length of 5000 characters. Please shorten your message.");
        return;
      }
      
      // Check payload size before sending
      const messagePayload = {
        content: inputText.trim(),
        recipientId: recipientId as string,
        threadId: threadId as string || undefined,
      };
      
      const payloadSize = new Blob([JSON.stringify(messagePayload)]).size;
      const maxSize = 1 * 1024 * 1024; // 1MB
      
      if (payloadSize > maxSize) {
        Alert.alert(
          "Message Too Large", 
          `Your message is too large (${(payloadSize / (1024 * 1024)).toFixed(2)}MB). Please shorten it and try again.`
        );
        return;
      }
      
      setSending(true);
      
      // Store the message text before clearing input
      const messageText = inputText.trim();
      setInputText('');
      
      // Send message using tRPC mutation
      sendMessageMutation.mutate(messagePayload);
      
      // Also update local state for immediate feedback
      await sendMessage(messagePayload);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Check if the error is related to payload size
      if (error instanceof Error && 
          (error.message.includes('payload') || 
           error.message.includes('size') || 
           error.message.includes('large'))) {
        Alert.alert('Error', 'Your message is too large. Please shorten it and try again.');
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
      
      // Restore the input text if sending failed
      setInputText(inputText);
      setSending(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };
  
  const renderMessageItem = ({ item }: { item: Message }) => {
    if (!item || !item.senderId) {
      console.error('Invalid message item:', item);
      return null;
    }
    
    const isCurrentUser = item.senderId === user?.id;
    
    // Format timestamp
    const messageDate = new Date(item.timestamp);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    
    let timeString;
    if (isToday) {
      timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      timeString = messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Image 
            source={{ uri: recipientImage as string || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000' }} 
            style={styles.avatar} 
          />
        )}
        
        {isCurrentUser && <View style={styles.avatarSpacer} />}
        
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>{timeString}</Text>
        </View>
      </View>
    );
  };
  
  // Determine if we're still loading
  const isStillLoading = loading || storeLoading || isMessagesLoading;
  
  // Determine if we have messages to show
  const hasMessages = messages && messages.length > 0;
  
  // Get the date for the header
  const headerDate = hasMessages 
    ? new Date(messages[0].timestamp).toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Today';
  
  // Calculate remaining characters
  const maxMessageLength = 5000;
  const remainingChars = maxMessageLength - inputText.length;
  const showCharCount = inputText.length > 0;
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen 
        options={{
          title: recipientName as string,
          headerTitleStyle: styles.headerTitle,
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
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <>
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>{headerDate}</Text>
            <View style={styles.dateLine} />
          </View>
          
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id || `msg-${Date.now()}-${Math.random()}`}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
              </View>
            )}
          />
        </>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.text.tertiary}
          multiline
          maxLength={maxMessageLength}
        />
        
        {showCharCount && (
          <View style={[
            styles.charCountContainer,
            remainingChars < 500 ? styles.charCountContainerWarning : null,
            remainingChars < 100 ? styles.charCountContainerDanger : null
          ]}>
            <Text 
              style={[
                styles.charCountText,
                remainingChars < 500 ? styles.charCountWarning : null,
                remainingChars < 100 ? styles.charCountDanger : null
              ]}
            >
              {remainingChars}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.disabledSendButton
          ]} 
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.text.inverse} />
          ) : (
            <Send size={20} color={!inputText.trim() ? Colors.text.tertiary : Colors.text.inverse} />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Message size warning */}
      {inputText.length > 3000 && (
        <View style={styles.warningContainer}>
          <Info size={16} color={Colors.status.warning} />
          <Text style={styles.warningText}>
            Large messages may take longer to send. Consider breaking it into smaller messages.
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
    marginLeft: 4,
  },
  messageList: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  avatarSpacer: {
    width: 28,
    marginLeft: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  currentUserBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: Colors.background.darker,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  currentUserText: {
    color: Colors.text.inverse,
  },
  otherUserText: {
    color: Colors.text.primary,
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    color: Colors.text.tertiary,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.background.darker,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.background.darker,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background.darker,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 48,
    color: Colors.text.primary,
    fontSize: 16,
    maxHeight: 120,
  },
  charCountContainer: {
    position: 'absolute',
    right: 64,
    bottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  charCountContainerWarning: {
    backgroundColor: 'rgba(255, 170, 0, 0.2)',
  },
  charCountContainerDanger: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  charCountText: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  charCountWarning: {
    color: Colors.status.warning,
  },
  charCountDanger: {
    color: Colors.status.error,
  },
  sendButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: Colors.background.darker,
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
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 170, 0, 0.3)',
  },
  warningText: {
    fontSize: 12,
    color: Colors.status.warning,
    marginLeft: 8,
    flex: 1,
  },
});