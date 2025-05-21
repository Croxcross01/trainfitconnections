import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Bell, Calendar, Clock, CheckCircle, Trash2, X, ThumbsUp, ThumbsDown, DollarSign, CreditCard, Lightbulb, Info } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Reminder, Session } from '@/types';
import Colors from '@/constants/colors';
import { layout } from '@/styles/layout';

// Payment methods
const paymentMethods = [
  { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: CreditCard },
  { id: 'cash', name: 'Cash', icon: DollarSign },
];

export default function ReminderDetailScreen() {
  const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId?: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    reminders: clientReminders, 
    deleteReminder: deleteClientReminder,
    sessions: clientSessions,
    makePayment,
    markReminderAsRead: markClientReminderAsRead
  } = useClientStore();
  const { 
    reminders: trainerReminders, 
    deleteReminder: deleteTrainerReminder,
    acceptSession,
    declineSession,
    sessions: trainerSessions,
    markReminderAsRead: markTrainerReminderAsRead
  } = useTrainerStore();
  
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineInput, setShowDeclineInput] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [isLoading, setIsLoading] = useState(false);
  
  const isTrainer = user?.role === 'trainer';
  
  useEffect(() => {
    // Find the reminder in the appropriate store
    const foundReminder = isTrainer
      ? trainerReminders.find(r => r.id === id)
      : clientReminders.find(r => r.id === id);
    
    if (foundReminder) {
      setReminder(foundReminder);
    }
    
    // If sessionId is provided, find the session
    if (sessionId) {
      const foundSession = isTrainer
        ? trainerSessions.find(s => s.id === sessionId)
        : clientSessions.find(s => s.id === sessionId);
      
      if (foundSession) {
        setSession(foundSession);
      }
    } else if (foundReminder && foundReminder.relatedId) {
      // If reminder has a relatedId, try to find the session
      const foundSession = isTrainer
        ? trainerSessions.find(s => s.id === foundReminder.relatedId)
        : clientSessions.find(s => s.id === foundReminder.relatedId);
      
      if (foundSession) {
        setSession(foundSession);
      }
    }
  }, [id, sessionId, isTrainer, trainerReminders, clientReminders, trainerSessions, clientSessions]);
  
  if (!reminder && !session) {
    return (
      <View style={layout.screen}>
        <Text style={styles.errorText}>Notification not found</Text>
      </View>
    );
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const handleMarkAsRead = () => {
    if (!reminder) return;
    
    // Mark as read in the appropriate store
    if (isTrainer) {
      markTrainerReminderAsRead(reminder.id);
    } else {
      markClientReminderAsRead(reminder.id);
    }
    
    Alert.alert(
      "Notification Marked as Read",
      "This notification has been marked as read.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };
  
  const handleDelete = () => {
    if (!reminder) return;
    
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Delete from the appropriate store
            if (isTrainer) {
              deleteTrainerReminder(reminder.id);
            } else {
              deleteClientReminder(reminder.id);
            }
            router.back();
          }
        }
      ]
    );
  };
  
  const handleAcceptSession = () => {
    if (!session) return;
    
    setIsLoading(true);
    
    // Accept the session
    acceptSession(session.id);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Session Accepted",
        "You have accepted this session request. The client has been notified.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }, 1000);
  };
  
  const handleDeclineSession = () => {
    if (showDeclineInput) {
      if (!session) return;
      
      setIsLoading(true);
      
      // Decline the session with optional reason
      declineSession(session.id, declineReason.trim() || undefined);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          "Session Declined",
          "You have declined this session request. The client has been notified.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }, 1000);
    } else {
      // Show the decline reason input
      setShowDeclineInput(true);
    }
  };
  
  const handleCancelDecline = () => {
    setShowDeclineInput(false);
    setDeclineReason('');
  };
  
  const handleMakePayment = async () => {
    if (!session) return;
    
    if (showPaymentOptions) {
      setIsLoading(true);
      
      try {
        // Process payment
        await makePayment(session.id, session.cost || 0, selectedPaymentMethod);
        
        // Show success message
        Alert.alert(
          "Payment Successful",
          `Your payment of $${session.cost?.toFixed(2)} has been processed successfully.`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } catch (error) {
        Alert.alert(
          "Payment Failed",
          "There was an error processing your payment. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Show payment options
      setShowPaymentOptions(true);
    }
  };
  
  const handleCancelPayment = () => {
    setShowPaymentOptions(false);
  };
  
  const handleViewSession = () => {
    if (session) {
      router.push(`/session/${session.id}`);
    } else if (reminder && reminder.relatedId) {
      router.push(`/session/${reminder.relatedId}`);
    }
  };
  
  // Determine if this is a session request that needs action
  const isSessionRequest = isTrainer && reminder?.type === 'session_request';
  const isSessionResponse = !isTrainer && (reminder?.type === 'session_accepted' || reminder?.type === 'session_declined');
  const isPaymentNeeded = !isTrainer && session && session.status === 'scheduled' && session.paymentStatus === 'pending';
  const isNonInteractive = reminder?.type === 'tip' || reminder?.type === 'general_update';
  
  // Get the appropriate icon for the notification type
  const getNotificationIcon = () => {
    if (!reminder) return <Bell size={24} color={Colors.primary} />;
    
    switch (reminder.type) {
      case 'session_request':
        return <Bell size={24} color={Colors.status.warning} />;
      case 'session_accepted':
        return <CheckCircle size={24} color={Colors.status.success} />;
      case 'session_declined':
        return <X size={24} color={Colors.status.error} />;
      case 'payment':
        return <DollarSign size={24} color={Colors.status.success} />;
      case 'tip':
        return <Lightbulb size={24} color="#FFD700" />;
      case 'general_update':
        return <Info size={24} color={Colors.status.info} />;
      default:
        return <Bell size={24} color={Colors.primary} />;
    }
  };
  
  // Get the appropriate payment method icon
  const getPaymentMethodIcon = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method) return <CreditCard size={20} color={Colors.text.secondary} />;
    
    return <method.icon size={20} color={selectedPaymentMethod === methodId ? Colors.primary : Colors.text.secondary} />;
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Notification",
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Trash2 size={20} color={Colors.status.error} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.container}>
        {reminder && (
          <Card style={[
            styles.reminderCard,
            isNonInteractive && styles.tipCard
          ]}>
            <View style={[
              styles.iconContainer,
              reminder.type === 'tip' && styles.tipIconContainer,
              reminder.type === 'general_update' && styles.updateIconContainer
            ]}>
              {getNotificationIcon()}
            </View>
            
            <Text style={[
              styles.title,
              isNonInteractive && styles.tipTitle
            ]}>
              {reminder.title}
            </Text>
            
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Calendar size={16} color={Colors.text.secondary} />
                <Text style={styles.metaText}>{formatDate(reminder.date)}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Clock size={16} color={Colors.text.secondary} />
                <Text style={styles.metaText}>{reminder.time}</Text>
              </View>
            </View>
            
            {(reminder.trainerId || reminder.clientId) && (
              <View style={styles.fromContainer}>
                <Text style={styles.fromLabel}>From:</Text>
                <Text style={styles.fromText}>
                  {isTrainer ? 'Client' : 'Your Trainer'}
                </Text>
              </View>
            )}
            
            <View style={[
              styles.messageContainer,
              isNonInteractive && styles.tipMessageContainer
            ]}>
              <Text style={[
                styles.message,
                isNonInteractive && styles.tipMessage
              ]}>
                {reminder.message}
              </Text>
            </View>
            
            {isSessionResponse && reminder.type === 'session_declined' && (
              <View style={styles.responseBox}>
                <Text style={styles.responseLabel}>Status:</Text>
                <Text style={styles.declinedText}>Your session request was declined</Text>
              </View>
            )}
            
            {isSessionResponse && reminder.type === 'session_accepted' && (
              <View style={styles.responseBox}>
                <Text style={styles.responseLabel}>Status:</Text>
                <Text style={styles.acceptedText}>Your session request was accepted</Text>
              </View>
            )}
          </Card>
        )}
        
        {session && !isNonInteractive && (
          <Card style={styles.sessionCard}>
            <Text style={styles.sessionTitle}>Session Details</Text>
            
            <View style={styles.sessionDetail}>
              <Calendar size={16} color={Colors.primary} />
              <Text style={styles.sessionDetailText}>
                {formatDate(session.date)}
              </Text>
            </View>
            
            <View style={styles.sessionDetail}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.sessionDetailText}>
                {session.startTime} - {session.endTime}
              </Text>
            </View>
            
            {session.location && (
              <View style={styles.sessionDetail}>
                <Bell size={16} color={Colors.primary} />
                <Text style={styles.sessionDetailText}>
                  {session.location.address}
                </Text>
              </View>
            )}
            
            {session.cost && (
              <View style={styles.sessionDetail}>
                <DollarSign size={16} color={Colors.primary} />
                <Text style={styles.sessionDetailText}>
                  ${session.cost.toFixed(2)}
                  {session.paymentStatus && (
                    <Text style={[
                      styles.paymentStatusText,
                      session.paymentStatus === 'paid' ? styles.paidText : 
                      session.paymentStatus === 'pending' ? styles.pendingText : 
                      styles.otherPaymentText
                    ]}>
                      {' • '}
                      {session.paymentStatus.charAt(0).toUpperCase() + session.paymentStatus.slice(1)}
                    </Text>
                  )}
                </Text>
              </View>
            )}
            
            <Button
              title="View Full Session Details"
              onPress={handleViewSession}
              variant="outline"
              style={styles.viewSessionButton}
              fullWidth
            />
          </Card>
        )}
        
        {isSessionRequest && !showDeclineInput && (
          <View style={styles.actionButtons}>
            <Button
              title="Accept Request"
              onPress={handleAcceptSession}
              isLoading={isLoading}
              style={styles.acceptButton}
              icon={<ThumbsUp size={18} color={Colors.text.inverse} />}
              fullWidth
            />
            
            <Button
              title="Decline Request"
              onPress={handleDeclineSession}
              variant="outline"
              style={styles.declineButton}
              textStyle={styles.declineButtonText}
              icon={<ThumbsDown size={18} color={Colors.status.error} />}
              fullWidth
            />
          </View>
        )}
        
        {isSessionRequest && showDeclineInput && (
          <Card style={styles.declineCard}>
            <Text style={styles.declineTitle}>Decline Reason (Optional)</Text>
            <Text style={styles.declineSubtitle}>
              Provide a brief reason why you're declining this session request.
            </Text>
            
            <TextInput
              style={styles.declineInput}
              placeholder="Enter reason (optional)"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={declineReason}
              onChangeText={setDeclineReason}
            />
            
            <View style={styles.declineActions}>
              <Button
                title="Cancel"
                onPress={handleCancelDecline}
                variant="outline"
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
              />
              
              <Button
                title="Decline Session"
                onPress={handleDeclineSession}
                isLoading={isLoading}
                style={styles.confirmDeclineButton}
              />
            </View>
          </Card>
        )}
        
        {isPaymentNeeded && !showPaymentOptions && (
          <Card style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <DollarSign size={24} color={Colors.primary} />
              <Text style={styles.paymentTitle}>Payment Required</Text>
            </View>
            
            <Text style={styles.paymentDescription}>
              Your session has been confirmed. Please complete the payment to secure your booking.
            </Text>
            
            <View style={styles.paymentAmount}>
              <Text style={styles.paymentAmountLabel}>Amount Due:</Text>
              <Text style={styles.paymentAmountValue}>${session.cost?.toFixed(2)}</Text>
            </View>
            
            <Button
              title="Make Payment"
              onPress={handleMakePayment}
              style={styles.paymentButton}
              fullWidth
            />
          </Card>
        )}
        
        {isPaymentNeeded && showPaymentOptions && (
          <Card style={styles.paymentOptionsCard}>
            <Text style={styles.paymentOptionsTitle}>Select Payment Method</Text>
            
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodRow,
                  selectedPaymentMethod === method.id && styles.paymentMethodRowActive
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodInfo}>
                  {getPaymentMethodIcon(method.id)}
                  <Text style={[
                    styles.paymentMethodName,
                    selectedPaymentMethod === method.id && styles.paymentMethodNameActive
                  ]}>
                    {method.name}
                  </Text>
                </View>
                
                <View style={[
                  styles.radioButton, 
                  selectedPaymentMethod === method.id && styles.radioButtonSelected
                ]}>
                  {selectedPaymentMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
            
            <View style={styles.paymentActions}>
              <Button
                title="Cancel"
                onPress={handleCancelPayment}
                variant="outline"
                style={styles.cancelPaymentButton}
                textStyle={styles.cancelPaymentButtonText}
              />
              
              <Button
                title={`Pay $${session.cost?.toFixed(2)}`}
                onPress={handleMakePayment}
                isLoading={isLoading}
                style={styles.confirmPaymentButton}
              />
            </View>
          </Card>
        )}
        
        {!isSessionRequest && !isPaymentNeeded && !reminder?.isRead && !isNonInteractive && (
          <Button
            title="Mark as Read"
            onPress={handleMarkAsRead}
            style={styles.markAsReadButton}
            icon={<CheckCircle size={18} color={Colors.text.inverse} />}
          />
        )}
        
        {!isSessionRequest && !isPaymentNeeded && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash2 size={18} color={Colors.status.error} />
            <Text style={styles.deleteButtonText}>Delete Notification</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background.dark,
  },
  headerButton: {
    padding: 8,
  },
  reminderCard: {
    marginBottom: 24,
  },
  tipCard: {
    borderColor: Colors.status.info,
    borderWidth: 1,
    backgroundColor: 'rgba(66, 153, 225, 0.05)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tipIconContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  updateIconContainer: {
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  tipTitle: {
    color: Colors.status.info,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  fromContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  fromLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginRight: 8,
  },
  fromText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  messageContainer: {
    backgroundColor: Colors.background.dark,
    padding: 16,
    borderRadius: 12,
  },
  tipMessageContainer: {
    backgroundColor: 'rgba(66, 153, 225, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.status.info,
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  tipMessage: {
    fontStyle: 'italic',
    color: Colors.text.primary,
  },
  responseBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  acceptedText: {
    fontSize: 16,
    color: Colors.status.success,
    fontWeight: '500',
  },
  declinedText: {
    fontSize: 16,
    color: Colors.status.error,
    fontWeight: '500',
  },
  sessionCard: {
    marginBottom: 24,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionDetailText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginLeft: 12,
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paidText: {
    color: Colors.status.success,
  },
  pendingText: {
    color: Colors.status.warning,
  },
  otherPaymentText: {
    color: Colors.text.secondary,
  },
  viewSessionButton: {
    marginTop: 8,
  },
  actionButtons: {
    marginBottom: 24,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: Colors.status.success,
  },
  declineButton: {
    borderColor: Colors.status.error,
    borderWidth: 2,
  },
  declineButtonText: {
    color: Colors.status.error,
  },
  declineCard: {
    marginBottom: 24,
  },
  declineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  declineSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  declineInput: {
    backgroundColor: Colors.background.dark,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 120,
    marginBottom: 16,
  },
  declineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: Colors.border.light,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
  },
  confirmDeclineButton: {
    flex: 1,
    backgroundColor: Colors.status.error,
  },
  paymentCard: {
    marginBottom: 24,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  paymentDescription: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  paymentAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  paymentAmountLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  paymentAmountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  paymentButton: {
    backgroundColor: Colors.primary,
  },
  paymentOptionsCard: {
    marginBottom: 24,
  },
  paymentOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: Colors.background.darker,
  },
  paymentMethodRowActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  paymentMethodNameActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelPaymentButton: {
    flex: 1,
    borderColor: Colors.border.light,
  },
  cancelPaymentButtonText: {
    color: Colors.text.secondary,
  },
  confirmPaymentButton: {
    flex: 2,
    backgroundColor: Colors.primary,
  },
  markAsReadButton: {
    marginBottom: 16,
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.status.error,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 24,
  },
});