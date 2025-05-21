import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, MapPin, FileText, DollarSign, CreditCard, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { SessionType, Trainer, CustomRate } from '@/types';
import { formatTo12Hour, dateToTimeString } from '@/utils/time-format';

// Session type options with proper typing
const sessionTypes: { value: SessionType; label: string }[] = [
  { value: 'one-on-one', label: 'One-on-One' },
  { value: 'group', label: 'Group Session' },
  { value: 'virtual', label: 'Virtual Session' },
  { value: 'house-call', label: 'House Call' }
];

// Payment methods
const paymentMethods = [
  { id: 'credit_card', name: 'Credit Card', icon: CreditCard },
  { id: 'paypal', name: 'PayPal', icon: CreditCard },
  { id: 'bank', name: 'Bank Transfer', icon: CreditCard },
  { id: 'cash', name: 'Cash', icon: DollarSign },
];

export default function BookSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { nearbyTrainers, bookSession, makePayment, isLoading } = useClientStore();
  
  const trainerId = params.trainerId as string;
  const trainer = nearbyTrainers.find(t => t.id === trainerId);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('one-on-one');
  const [notes, setNotes] = useState('');
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [customRate, setCustomRate] = useState<CustomRate | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [payNow, setPayNow] = useState(true); // Default to pay now
  const [bookingStep, setBookingStep] = useState(1); // 1: Details, 2: Payment
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Set default rate
  useEffect(() => {
    if (trainer) {
      if (trainer.rateType === 'hourly') {
        setSelectedRate('hourly');
      } else if (trainer.customRates && trainer.customRates.length > 0) {
        setSelectedRate(trainer.customRates[0].id);
        setCustomRate(trainer.customRates[0]);
      }
    }
  }, [trainer]);
  
  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  // Handle start time change
  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
    
    // Update end time to be 1 hour after start time
    const newEndTime = new Date(currentTime);
    newEndTime.setHours(currentTime.getHours() + 1);
    setEndTime(newEndTime);
  };
  
  // Handle end time change
  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
  };
  
  // Format time for display
  const formatTimeForDisplay = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get session cost
  const getSessionCost = () => {
    if (!trainer) return 0;
    
    if (selectedRate === 'hourly' && trainer.hourlyRate) {
      // Calculate cost based on duration
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      return trainer.hourlyRate * durationHours;
    } else if (customRate) {
      return customRate.amount;
    }
    
    return 0;
  };
  
  // Handle session booking
  const handleBookSession = () => {
    if (!user || !trainer) {
      Alert.alert('Error', 'Unable to book session. Please try again.');
      return;
    }
    
    // Validate session details
    if (startTime >= endTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }
    
    // Format times for API - convert to 24-hour format for storage
    const formattedStartTime = dateToTimeString(startTime);
    const formattedEndTime = dateToTimeString(endTime);
    
    // Create session object
    const sessionData = {
      trainerId: trainer.id,
      clientId: user.id,
      date: date.toISOString(),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      status: 'pending' as const,
      type: sessionType,
      notes,
      location: trainer.location,
      cost: getSessionCost(),
      paymentStatus: 'pending' as const,
      paymentMethod: selectedPaymentMethod as 'credit_card' | 'paypal' | 'bank' | 'cash',
      // Fix: Convert null to undefined for customRateId
      customRateId: selectedRate !== 'hourly' ? selectedRate || undefined : undefined
    };
    
    try {
      // Book session
      const newSession = bookSession(sessionData);
      setSessionId(newSession.id);
      
      if (payNow) {
        // Move to payment step
        setBookingStep(2);
      } else {
        // Show success message
        Alert.alert(
          'Session Request Sent',
          `Your session request has been sent to ${trainer.name}. You'll be notified when they respond.`,
          [
            { 
              text: 'OK', 
              onPress: () => router.replace('/(tabs)/schedule')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book session. Please try again.');
    }
  };
  
  // Handle payment
  const handlePayment = async () => {
    if (!sessionId || !trainer) return;
    
    try {
      // Process payment
      await makePayment(sessionId, getSessionCost(), selectedPaymentMethod);
      
      // Show success message
      Alert.alert(
        'Payment Successful',
        `Your payment of $${getSessionCost().toFixed(2)} has been processed successfully. Your session request has been sent to ${trainer.name}.`,
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/(tabs)/schedule')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
    }
  };
  
  if (!trainer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trainer not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="primary"
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  // Render booking details step
  const renderBookingDetails = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Book a Session with {trainer.name}</Text>
        <Text style={styles.subtitle}>
          Fill in the details below to request a training session
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} color={Colors.text.secondary} style={styles.inputIcon} />
          <View style={styles.inputContent}>
            <Text style={styles.inputLabel}>Date</Text>
            <Text style={styles.inputValue}>{formatDate(date)}</Text>
          </View>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}
        
        <View style={styles.timeContainer}>
          <TouchableOpacity
            style={[styles.inputContainer, styles.timeInput]}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Clock size={20} color={Colors.text.secondary} style={styles.inputIcon} />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <Text style={styles.inputValue}>{formatTimeForDisplay(startTime)}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.inputContainer, styles.timeInput]}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Clock size={20} color={Colors.text.secondary} style={styles.inputIcon} />
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>End Time</Text>
              <Text style={styles.inputValue}>{formatTimeForDisplay(endTime)}</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={onStartTimeChange}
          />
        )}
        
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="default"
            onChange={onEndTimeChange}
          />
        )}
        
        <Text style={styles.fieldLabel}>Session Type</Text>
        <View style={styles.sessionTypeContainer}>
          {sessionTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.sessionTypeButton,
                sessionType === type.value && styles.sessionTypeButtonActive
              ]}
              onPress={() => setSessionType(type.value)}
            >
              {sessionType === type.value && (
                <Check size={16} color={Colors.primary} style={styles.sessionTypeIcon} />
              )}
              <Text
                style={[
                  styles.sessionTypeText,
                  sessionType === type.value && styles.sessionTypeTextActive
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Input
          label="Notes (Optional)"
          placeholder="Any specific goals or requests for this session?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.notesInput}
          leftIcon={<FileText size={20} color={Colors.text.secondary} />}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <View style={styles.locationContainer}>
          <MapPin size={20} color={Colors.text.secondary} style={styles.locationIcon} />
          <Text style={styles.locationText}>
            {sessionType === 'virtual' 
              ? 'Virtual Session (Link will be provided)' 
              : sessionType === 'house-call' 
                ? 'Your location (Address in your profile)' 
                : trainer.location?.address || 'Trainer\'s location'}
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        
        {trainer.rateType === 'custom' && trainer.customRates && trainer.customRates.length > 0 ? (
          <>
            <Text style={styles.fieldLabel}>Select Package</Text>
            <View style={styles.ratesContainer}>
              {trainer.hourlyRate && (
                <TouchableOpacity
                  style={[
                    styles.rateCard,
                    selectedRate === 'hourly' && styles.rateCardActive
                  ]}
                  onPress={() => {
                    setSelectedRate('hourly');
                    setCustomRate(null);
                  }}
                >
                  <Text style={styles.rateTitle}>Hourly Rate</Text>
                  <Text style={styles.rateAmount}>${trainer.hourlyRate}/hr</Text>
                  {selectedRate === 'hourly' && (
                    <View style={styles.rateSelectedIndicator}>
                      <Check size={16} color={Colors.text.inverse} />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              
              {trainer.customRates.map(rate => (
                <TouchableOpacity
                  key={rate.id}
                  style={[
                    styles.rateCard,
                    selectedRate === rate.id && styles.rateCardActive
                  ]}
                  onPress={() => {
                    setSelectedRate(rate.id);
                    setCustomRate(rate);
                  }}
                >
                  <Text style={styles.rateTitle}>{rate.title}</Text>
                  <Text style={styles.rateAmount}>${rate.amount}</Text>
                  {selectedRate === rate.id && (
                    <View style={styles.rateSelectedIndicator}>
                      <Check size={16} color={Colors.text.inverse} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.hourlyRateContainer}>
            <DollarSign size={20} color={Colors.text.secondary} style={styles.hourlyRateIcon} />
            <Text style={styles.hourlyRateText}>
              ${trainer.hourlyRate}/hour
            </Text>
          </View>
        )}
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Cost:</Text>
          <Text style={styles.totalAmount}>${getSessionCost().toFixed(2)}</Text>
        </View>
        
        <View style={styles.paymentOptionsContainer}>
          <Text style={styles.fieldLabel}>Payment Options</Text>
          
          <TouchableOpacity 
            style={[
              styles.paymentOptionButton,
              payNow && styles.paymentOptionButtonActive
            ]}
            onPress={() => setPayNow(true)}
          >
            {payNow && (
              <Check size={16} color={Colors.primary} style={styles.paymentOptionIcon} />
            )}
            <Text
              style={[
                styles.paymentOptionText,
                payNow && styles.paymentOptionTextActive
              ]}
            >
              Pay Now
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.paymentOptionButton,
              !payNow && styles.paymentOptionButtonActive
            ]}
            onPress={() => setPayNow(false)}
          >
            {!payNow && (
              <Check size={16} color={Colors.primary} style={styles.paymentOptionIcon} />
            )}
            <Text
              style={[
                styles.paymentOptionText,
                !payNow && styles.paymentOptionTextActive
              ]}
            >
              Pay Later
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.paymentNote}>
            {payNow 
              ? "Your payment will be processed immediately after booking."
              : "Payment will be processed after the trainer accepts your request."}
          </Text>
        </View>
      </View>
      
      <Button
        title={payNow ? "Continue to Payment" : "Request Session"}
        onPress={handleBookSession}
        variant="primary"
        isLoading={isLoading}
        style={styles.bookButton}
        fullWidth
      />
    </>
  );
  
  // Render payment step
  const renderPaymentStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.subtitle}>
          Complete your payment to book the session
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Summary</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Trainer:</Text>
          <Text style={styles.summaryValue}>{trainer.name}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{formatDate(date)}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Time:</Text>
          <Text style={styles.summaryValue}>{formatTimeForDisplay(startTime)} - {formatTimeForDisplay(endTime)}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Type:</Text>
          <Text style={styles.summaryValue}>
            {sessionType === 'one-on-one' ? 'One-on-One' : 
             sessionType === 'group' ? 'Group Session' : 
             sessionType === 'virtual' ? 'Virtual Session' : 
             'House Call'}
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryTotal}>${getSessionCost().toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodButton,
              selectedPaymentMethod === method.id && styles.paymentMethodButtonActive
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <method.icon 
              size={20} 
              color={selectedPaymentMethod === method.id ? Colors.primary : Colors.text.secondary} 
              style={styles.paymentMethodIcon} 
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === method.id && styles.paymentMethodTextActive
              ]}
            >
              {method.name}
            </Text>
            {selectedPaymentMethod === method.id && (
              <View style={styles.paymentMethodCheck}>
                <Check size={16} color={Colors.primary} />
              </View>
            )}
          </TouchableOpacity>
        ))}
        
        <Text style={styles.securePaymentNote}>
          All payments are secure and encrypted. Your payment information is never stored on our servers.
        </Text>
      </View>
      
      <View style={styles.paymentActions}>
        <Button
          title="Back"
          onPress={() => setBookingStep(1)}
          variant="outline"
          style={styles.backButton}
        />
        
        <Button
          title={`Pay $${getSessionCost().toFixed(2)}`}
          onPress={handlePayment}
          variant="primary"
          isLoading={isLoading}
          style={styles.payButton}
        />
      </View>
    </>
  );
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {bookingStep === 1 ? renderBookingDetails() : renderPaymentStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  sectionTitle: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 12,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  inputValue: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    width: '48%',
  },
  fieldLabel: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  sessionTypeContainer: {
    marginBottom: 16,
  },
  sessionTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 12,
    marginBottom: 8,
  },
  sessionTypeButtonActive: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderColor: Colors.primary,
  },
  sessionTypeIcon: {
    marginRight: 8,
  },
  sessionTypeText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  sessionTypeTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 16,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationText: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    flex: 1,
  },
  ratesContainer: {
    marginBottom: 16,
  },
  rateCard: {
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 16,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  rateCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  rateTitle: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  rateAmount: {
    ...typography.bodyLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  rateSelectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 12,
    padding: 4,
  },
  hourlyRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 16,
    marginBottom: 16,
  },
  hourlyRateIcon: {
    marginRight: 12,
  },
  hourlyRateText: {
    ...typography.bodyLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  totalLabel: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  totalAmount: {
    ...typography.h4,
    color: Colors.primary,
    fontWeight: '600',
  },
  paymentOptionsContainer: {
    marginTop: 8,
  },
  paymentOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 12,
    marginBottom: 8,
  },
  paymentOptionButtonActive: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderColor: Colors.primary,
  },
  paymentOptionIcon: {
    marginRight: 8,
  },
  paymentOptionText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  paymentOptionTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  paymentNote: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  bookButton: {
    marginTop: 8,
  },
  errorText: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    alignSelf: 'center',
  },
  // Payment step styles
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  summaryLabel: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  summaryValue: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  summaryTotal: {
    ...typography.bodyLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 16,
    marginBottom: 12,
  },
  paymentMethodButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
  },
  paymentMethodIcon: {
    marginRight: 12,
  },
  paymentMethodText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    flex: 1,
  },
  paymentMethodTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  paymentMethodCheck: {
    marginLeft: 8,
  },
  securePaymentNote: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  payButton: {
    flex: 2,
    marginLeft: 8,
  },
});