import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar, Clock, MapPin, User, Edit, ChevronLeft, DollarSign, Star, CreditCard } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { Session } from '@/types';
import { formatTime } from '@/utils/time-format';

// Payment methods
const paymentMethods = [
  { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: CreditCard },
  { id: 'cash', name: 'Cash', icon: DollarSign },
];

export default function SessionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    sessions: clientSessions, 
    cancelSession: cancelClientSession, 
    nearbyTrainers,
    makePayment
  } = useClientStore();
  const { 
    sessions: trainerSessions, 
    cancelSession: cancelTrainerSession,
    updateSession,
    clients
  } = useTrainerStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const isTrainer = user?.role === 'trainer';
  
  useEffect(() => {
    // Find the session in the appropriate store
    const foundSession = isTrainer 
      ? trainerSessions.find(s => s.id === id)
      : clientSessions.find(s => s.id === id);
    
    if (foundSession) {
      setSession(foundSession);
    } else {
      console.error(`Session with ID ${id} not found`);
      Alert.alert(
        "Session Not Found", 
        `Could not find session with ID: ${id}. Please try again or contact support.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [id, isTrainer, trainerSessions, clientSessions]);
  
  if (!session) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading session details...</Text>
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
  
  const handleEditSession = () => {
    // Navigate to edit session screen
    router.push({
      pathname: isTrainer ? '/new-session' : '/book-session',
      params: { sessionId: session.id }
    });
  };
  
  const handleCancelSession = () => {
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this session?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            setIsLoading(true);
            
            // Cancel in the appropriate store
            if (isTrainer) {
              cancelTrainerSession(session.id);
            } else {
              cancelClientSession(session.id);
            }
            
            // Simulate API call
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert(
                "Session Cancelled",
                "The session has been cancelled successfully.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back()
                  }
                ]
              );
            }, 1000);
          }
        }
      ]
    );
  };
  
  const handleCompleteSession = () => {
    setIsLoading(true);
    
    // Update session status to completed
    updateSession(session.id, { status: 'completed' });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Session Completed",
        "The session has been marked as completed.",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    }, 1000);
  };
  
  const handleAcceptSession = () => {
    setIsLoading(true);
    
    // Check if this is a new client
    const client = clients.find(c => c.id === session.clientId);
    const isNewClient = client ? (client.sessionCount ?? 0) === 0 : false;
    
    // Accept the session
    updateSession(session.id, { 
      status: 'scheduled',
      isNewClient: isNewClient
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Session Accepted",
        `The session has been accepted and scheduled. ${isNewClient ? 'This is a new client!' : ''}`,
        [
          {
            text: "View Schedule",
            onPress: () => router.push('/(tabs)/schedule')
          },
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    }, 1000);
  };
  
  const handleDeclineSession = () => {
    Alert.alert(
      "Decline Session",
      "Are you sure you want to decline this session request?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes, Decline",
          style: "destructive",
          onPress: () => {
            setIsLoading(true);
            
            // Decline the session
            updateSession(session.id, { status: 'declined' });
            
            // Simulate API call
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert(
                "Session Declined",
                "The session request has been declined.",
                [
                  {
                    text: "OK",
                    onPress: () => router.back()
                  }
                ]
              );
            }, 1000);
          }
        }
      ]
    );
  };
  
  const handleMakePayment = async () => {
    if (showPaymentOptions) {
      setProcessingPayment(true);
      
      try {
        // Process payment
        await makePayment(session.id, session.cost || 0, selectedPaymentMethod);
        
        // Show success message
        Alert.alert(
          "Payment Successful",
          `Your payment of $${session.cost?.toFixed(2)} has been processed successfully.`,
          [
            {
              text: "OK",
              onPress: () => {
                setShowPaymentOptions(false);
                // Refresh session data
                const updatedSession = clientSessions.find(s => s.id === id);
                if (updatedSession) {
                  setSession(updatedSession);
                }
              }
            }
          ]
        );
      } catch (error) {
        Alert.alert(
          "Payment Failed",
          "There was an error processing your payment. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setProcessingPayment(false);
      }
    } else {
      // Show payment options
      setShowPaymentOptions(true);
    }
  };
  
  // Get client and trainer names from the stores
  const getClientName = () => {
    if (isTrainer) {
      // If trainer, get client name from clients list
      const client = clients.find(c => c.id === session.clientId);
      return client ? client.name : "Unknown Client";
    } else {
      // If client, return user's own name
      return user?.name || "You";
    }
  };
  
  const getTrainerName = () => {
    if (!isTrainer) {
      // If client, get trainer name from trainers list
      const trainer = nearbyTrainers.find(t => t.id === session.trainerId);
      return trainer ? trainer.name : "Unknown Trainer";
    } else {
      // If trainer, return user's own name
      return user?.name || "You";
    }
  };
  
  // Get client profile image
  const getClientProfileImage = () => {
    if (isTrainer) {
      const client = clients.find(c => c.id === session.clientId);
      return client?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000';
    }
    return user?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000';
  };
  
  // Get trainer profile image
  const getTrainerProfileImage = () => {
    if (!isTrainer) {
      const trainer = nearbyTrainers.find(t => t.id === session.trainerId);
      return trainer?.profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000';
    }
    return user?.profileImage || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000';
  };
  
  // Determine status color
  const getStatusColor = () => {
    switch (session.status) {
      case 'scheduled':
        return Colors.status.success;
      case 'completed':
        return Colors.status.success;
      case 'cancelled':
        return Colors.status.error;
      case 'pending':
        return Colors.status.warning;
      case 'declined':
        return Colors.status.error;
      default:
        return Colors.text.secondary;
    }
  };
  
  // Get status text
  const getStatusText = () => {
    const status = session.status;
    if (typeof status === 'string') {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    return 'Unknown';
  };
  
  // Get payment status color
  const getPaymentStatusColor = () => {
    switch (session.paymentStatus) {
      case 'paid':
        return Colors.status.success;
      case 'pending':
        return Colors.status.warning;
      case 'refunded':
        return Colors.text.secondary;
      case 'failed':
        return Colors.status.error;
      default:
        return Colors.status.error;
    }
  };
  
  // Check if this is a new client
  const isNewClient = session.isNewClient || false;
  
  // Get client session count
  const getClientSessionCount = () => {
    if (isTrainer) {
      const client = clients.find(c => c.id === session.clientId);
      return client?.sessionCount ?? 0;
    }
    return 0;
  };
  
  // Check if payment is needed
  const isPaymentNeeded = !isTrainer && 
                          session.status === 'scheduled' && 
                          session.paymentStatus === 'pending';
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Session Details",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.background.darker,
          },
          headerTintColor: Colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            session.status === 'scheduled' ? (
              <TouchableOpacity onPress={handleEditSession} style={styles.editButton}>
                <Edit size={20} color={Colors.primary} />
              </TouchableOpacity>
            ) : null
          )
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
        </View>
        
        {isTrainer && session.status === 'pending' && (
          <View style={[styles.card, { borderColor: Colors.status.warning, borderWidth: 1 }]}>
            <Text style={styles.pendingTitle}>Session Request</Text>
            <Text style={styles.pendingText}>
              This client has requested a session with you. Please accept or decline this request.
            </Text>
            
            {isNewClient || getClientSessionCount() === 0 ? (
              <View style={styles.newClientAlert}>
                <Star size={16} color={Colors.status.warning} />
                <Text style={styles.newClientAlertText}>
                  This is a new client who hasn't had any sessions with you yet!
                </Text>
              </View>
            ) : null}
            
            <View style={styles.pendingActions}>
              <Button
                title="Accept"
                onPress={handleAcceptSession}
                variant="primary"
                isLoading={isLoading}
                style={styles.acceptButton}
              />
              <Button
                title="Decline"
                onPress={handleDeclineSession}
                variant="outline"
                isLoading={isLoading}
                style={styles.declineButton}
                textStyle={{ color: Colors.status.error }}
              />
            </View>
          </View>
        )}
        
        {session.status === 'declined' && (
          <View style={[styles.card, { borderColor: Colors.status.error, borderWidth: 1 }]}>
            <Text style={styles.declinedTitle}>Session Declined</Text>
            <Text style={styles.declinedText}>
              {isTrainer 
                ? "You have declined this session request." 
                : "The trainer has declined your session request."}
              {session.declineReason && ` Reason: ${session.declineReason}`}
            </Text>
          </View>
        )}
        
        {/* Payment Required Card */}
        {isPaymentNeeded && !showPaymentOptions && (
          <View style={[styles.card, { borderColor: Colors.primary, borderWidth: 1 }]}>
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
          </View>
        )}
        
        {/* Payment Options */}
        {isPaymentNeeded && showPaymentOptions && (
          <View style={styles.card}>
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
                  <method.icon 
                    size={20} 
                    color={selectedPaymentMethod === method.id ? Colors.primary : Colors.text.secondary} 
                  />
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
                onPress={() => setShowPaymentOptions(false)}
                variant="outline"
                style={styles.cancelPaymentButton}
                textStyle={styles.cancelPaymentButtonText}
              />
              
              <Button
                title={`Pay $${session.cost?.toFixed(2)}`}
                onPress={handleMakePayment}
                isLoading={processingPayment}
                style={styles.confirmPaymentButton}
              />
            </View>
          </View>
        )}
        
        {/* Profile Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {isTrainer ? 'Client' : 'Trainer'}
          </Text>
          <View style={styles.profileContainer}>
            <Image 
              source={{ uri: isTrainer ? getClientProfileImage() : getTrainerProfileImage() }} 
              style={styles.profileImage} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {isTrainer ? getClientName() : getTrainerName()}
                {isTrainer && isNewClient && (
                  <Text style={styles.newClientTag}> (New Client)</Text>
                )}
              </Text>
              <Text style={styles.profileRole}>
                {isTrainer ? 'Client' : 'Trainer'}
                {isTrainer && (
                  <Text style={styles.sessionCount}>
                    {` • ${getClientSessionCount()} session${getClientSessionCount() !== 1 ? 's' : ''}`}
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          
          <View style={styles.detailRow}>
            <Calendar size={20} color={Colors.primary} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailText}>{formatDate(session.date)}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={20} color={Colors.primary} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailText}>{formatTime(session.startTime)} - {formatTime(session.endTime)}</Text>
            </View>
          </View>
          
          {session.location && (
            <View style={styles.detailRow}>
              <MapPin size={20} color={Colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailText}>{session.location.address}</Text>
              </View>
            </View>
          )}
          
          {session.type && (
            <View style={styles.detailRow}>
              <User size={20} color={Colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Session Type</Text>
                <Text style={styles.detailText}>
                  {session.type === 'one-on-one' ? '1-on-1 Training' : 
                   session.type === 'group' ? `Group Training (${session.participantCount || '?'})` : 
                   session.type === 'virtual' ? 'Virtual Session' : 
                   session.type === 'house-call' ? 'House Call' : 
                   session.type === 'in-person' ? 'In-Person Training' :
                   session.type}
                </Text>
              </View>
            </View>
          )}
          
          {session.cost && (
            <View style={styles.detailRow}>
              <DollarSign size={20} color={Colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Cost</Text>
                <Text style={styles.detailText}>
                  ${session.cost.toFixed(2)}
                  {session.paymentStatus && (
                    <Text style={[
                      styles.paymentStatus, 
                      { color: getPaymentStatusColor() }
                    ]}>
                      {' • '}
                      {typeof session.paymentStatus === 'string' ? 
                        session.paymentStatus.charAt(0).toUpperCase() + session.paymentStatus.slice(1) : 
                        'Unknown'}
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {session.notes && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Session Notes</Text>
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        )}
        
        {session.status === 'scheduled' && (
          <View style={styles.actionsContainer}>
            {isTrainer && (
              <Button
                title="Mark as Completed"
                onPress={handleCompleteSession}
                variant="primary"
                isLoading={isLoading}
                style={styles.completeButton}
                fullWidth
              />
            )}
            
            <Button
              title="Cancel Session"
              onPress={handleCancelSession}
              variant="outline"
              isLoading={isLoading}
              style={styles.cancelButton}
              textStyle={{ color: Colors.status.error }}
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.darker,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.inverse,
  },
  pendingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.status.warning,
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  newClientAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.status.warning,
  },
  newClientAlertText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  pendingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
    borderColor: Colors.status.error,
    borderWidth: 1,
  },
  declinedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.status.error,
    marginBottom: 8,
  },
  declinedText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  newClientTag: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.status.warning,
  },
  profileRole: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sessionCount: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesText: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  completeButton: {
    backgroundColor: Colors.status.success,
  },
  cancelButton: {
    borderColor: Colors.status.error,
    borderWidth: 1,
  },
  // Payment required card styles
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 12,
  },
  paymentDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  paymentAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    padding: 12,
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
  // Payment options styles
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
});