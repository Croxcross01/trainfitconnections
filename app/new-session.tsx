import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, MapPin, Users, X, Check, Video, Home, DollarSign, ChevronDown, ChevronUp } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/store/auth-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { Client, SessionType } from '@/types';
import { formatTo12Hour, formatTo24Hour, dateToTimeString } from '@/utils/time-format';

// Session type options
const sessionTypes = [
  { id: 'one-on-one', name: '1-on-1 Session', icon: Users, multiplier: 1.0 },
  { id: 'group', name: 'Group Session', icon: Users, multiplier: 0.7 },
  { id: 'virtual', name: 'Virtual Session', icon: Video, multiplier: 0.8 },
  { id: 'house-call', name: 'House Call', icon: Home, multiplier: 1.2 },
];

export default function NewSessionScreen() {
  const router = useRouter();
  const { sessionId, clientId: preselectedClientId } = useLocalSearchParams<{ 
    sessionId?: string;
    clientId?: string;
  }>();
  const { user } = useAuthStore();
  const { clients, sessions, scheduleSession, updateSession } = useTrainerStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('one-on-one');
  const [participantCount, setParticipantCount] = useState('1');
  const [sessionCost, setSessionCost] = useState('');
  const [rateType, setRateType] = useState<'hourly' | 'custom'>(user?.rateType || 'hourly');
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showSessionTypePicker, setShowSessionTypePicker] = useState(false);
  const [showRateOptions, setShowRateOptions] = useState(false);
  
  // Load existing session data if editing
  useEffect(() => {
    if (preselectedClientId) {
      setSelectedClient(preselectedClientId);
    }
    
    if (sessionId) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        setSelectedClient(session.clientId);
        setDate(new Date(session.date));
        
        // Parse start time
        const [startHour, startMinute] = session.startTime.split(':').map(Number);
        const startTimeDate = new Date();
        startTimeDate.setHours(startHour, startMinute, 0, 0);
        setStartTime(startTimeDate);
        
        // Parse end time
        const [endHour, endMinute] = session.endTime.split(':').map(Number);
        const endTimeDate = new Date();
        endTimeDate.setHours(endHour, endMinute, 0, 0);
        setEndTime(endTimeDate);
        
        if (session.location) {
          setLocation(session.location.address);
        }
        
        if (session.notes) {
          setNotes(session.notes);
        }
        
        if (session.type) {
          setSessionType(session.type);
        }
        
        if (session.participantCount) {
          setParticipantCount(session.participantCount.toString());
        }
        
        if (session.cost) {
          setSessionCost(session.cost.toString());
        }
        
        if (session.customRateId) {
          setSelectedRate(session.customRateId);
          setRateType('custom');
        }
      }
    }
  }, [sessionId, sessions, preselectedClientId]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };
  
  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
    
    // If end time is before start time, adjust end time
    if (endTime <= currentTime) {
      const newEndTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // 1 hour later
      setEndTime(newEndTime);
    }
  };
  
  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    
    // Ensure end time is after start time
    if (currentTime > startTime) {
      setEndTime(currentTime);
    } else {
      Alert.alert('Invalid Time', 'End time must be after start time');
    }
  };
  
  const getSessionTypeMultiplier = () => {
    const selectedType = sessionTypes.find(type => type.id === sessionType);
    return selectedType ? selectedType.multiplier : 1.0;
  };
  
  const getParticipantMultiplier = () => {
    // For group sessions, adjust price based on participant count
    if (sessionType === 'group') {
      const count = parseInt(participantCount, 10) || 1;
      if (count <= 1) return 1.0;
      if (count <= 3) return 1.2; // Slight increase for small groups
      if (count <= 5) return 1.4; // Medium groups
      return 1.6; // Large groups
    }
    return 1.0;
  };
  
  const calculateSessionCost = () => {
    // If a custom rate is selected, return that rate
    if (rateType === 'custom' && selectedRate && user?.customRates) {
      const customRate = user.customRates.find(rate => rate.id === selectedRate);
      if (customRate) {
        return customRate.amount;
      }
    }
    
    // Otherwise calculate based on hourly rate
    if (!user?.hourlyRate) return 0;
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Apply multipliers based on session type and participants
    const typeMultiplier = getSessionTypeMultiplier();
    const participantMultiplier = getParticipantMultiplier();
    
    return user.hourlyRate * durationHours * typeMultiplier * participantMultiplier;
  };
  
  const getSessionTypeName = () => {
    const selectedType = sessionTypes.find(type => type.id === sessionType);
    return selectedType ? selectedType.name : 'Standard Session';
  };
  
  const getSessionTypeIcon = () => {
    const selectedType = sessionTypes.find(type => type.id === sessionType);
    return selectedType ? selectedType.icon : Users;
  };
  
  const handleCreateSession = () => {
    // Validate inputs
    if (!selectedClient) {
      Alert.alert('Missing Information', 'Please select a client');
      return;
    }
    
    if (!location && sessionType !== 'virtual') {
      Alert.alert('Missing Information', 'Please enter a location');
      return;
    }
    
    if (sessionType === 'group' && (!participantCount || parseInt(participantCount, 10) < 1)) {
      Alert.alert('Invalid Input', 'Please enter a valid number of participants');
      return;
    }
    
    setIsLoading(true);
    
    // Format times to HH:MM format - convert to 24-hour format for storage
    const formattedStartTime = dateToTimeString(startTime);
    const formattedEndTime = dateToTimeString(endTime);
    
    // Calculate cost if not manually set
    const cost = sessionCost ? parseFloat(sessionCost) : calculateSessionCost();
    
    // Create new session object
    const sessionData = {
      trainerId: user?.id || 't1',
      clientId: selectedClient,
      date: date.toISOString(),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      status: 'scheduled' as const,
      type: sessionType,
      notes: notes,
      location: sessionType !== 'virtual' ? {
        latitude: 30.2672,
        longitude: -97.7431,
        address: location
      } : undefined,
      cost: cost,
      participantCount: sessionType === 'group' ? parseInt(participantCount, 10) : 1,
      paymentStatus: 'pending' as const,
      paymentMethod: 'credit_card' as const,
      customRateId: rateType === 'custom' && selectedRate ? selectedRate : undefined
    };
    
    // Simulate API call
    setTimeout(() => {
      try {
        if (sessionId) {
          // Update existing session
          updateSession(sessionId, sessionData);
          Alert.alert(
            'Success',
            'Session updated successfully',
            [
              {
                text: 'OK',
                onPress: () => router.back()
              }
            ]
          );
        } else {
          // Add new session
          scheduleSession(sessionData);
          Alert.alert(
            'Success',
            'Session scheduled successfully',
            [
              {
                text: 'OK',
                onPress: () => router.back()
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error saving session:', error);
        Alert.alert(
          'Error',
          'Failed to save session. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };
  
  const getSelectedClientName = () => {
    const client = clients.find(c => c.id === selectedClient);
    return client ? client.name : 'Select Client';
  };
  
  const SessionTypeIcon = getSessionTypeIcon();
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: sessionId ? "Edit Session" : "Schedule New Session",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Session Details</Text>
        
        <Card style={styles.card}>
          <TouchableOpacity 
            style={styles.inputRow}
            onPress={() => setShowClientPicker(!showClientPicker)}
          >
            <Users size={20} color={Colors.primary} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Client</Text>
              <Text style={[styles.inputText, !selectedClient && styles.placeholderText]}>
                {getSelectedClientName()}
              </Text>
            </View>
            <View style={styles.chevron} />
          </TouchableOpacity>
          
          {showClientPicker && (
            <View style={styles.pickerContainer}>
              {clients.map(client => (
                <TouchableOpacity
                  key={client.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedClient(client.id);
                    setShowClientPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{client.name}</Text>
                  {selectedClient === client.id && (
                    <Check size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.inputRow}
            onPress={() => setShowSessionTypePicker(!showSessionTypePicker)}
          >
            <SessionTypeIcon size={20} color={Colors.primary} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Session Type</Text>
              <Text style={styles.inputText}>{getSessionTypeName()}</Text>
            </View>
            <View style={styles.chevron} />
          </TouchableOpacity>
          
          {showSessionTypePicker && (
            <View style={styles.pickerContainer}>
              {sessionTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSessionType(type.id as SessionType);
                    setShowSessionTypePicker(false);
                  }}
                >
                  <View style={styles.pickerItemContent}>
                    <type.icon size={16} color={Colors.primary} />
                    <Text style={styles.pickerItemText}>{type.name}</Text>
                  </View>
                  {sessionType === type.id && (
                    <Check size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {sessionType === 'group' && (
            <>
              <View style={styles.divider} />
              <View style={styles.inputRow}>
                <Users size={20} color={Colors.primary} />
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Number of Participants</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter number of participants"
                    placeholderTextColor={Colors.text.tertiary}
                    value={participantCount}
                    onChangeText={setParticipantCount}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </>
          )}
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.inputRow}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={Colors.primary} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <Text style={styles.inputText}>{formatDate(date)}</Text>
            </View>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              style={styles.datePicker}
            />
          )}
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.inputRow}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Clock size={20} color={Colors.primary} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <Text style={styles.inputText}>{formatTimeForDisplay(startTime)}</Text>
            </View>
          </TouchableOpacity>
          
          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartTimeChange}
              style={styles.datePicker}
            />
          )}
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.inputRow}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Clock size={20} color={Colors.primary} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>End Time</Text>
              <Text style={styles.inputText}>{formatTimeForDisplay(endTime)}</Text>
            </View>
          </TouchableOpacity>
          
          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndTimeChange}
              style={styles.datePicker}
            />
          )}
          
          {sessionType !== 'virtual' && (
            <>
              <View style={styles.divider} />
              <View style={styles.inputRow}>
                <MapPin size={20} color={Colors.primary} />
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter location"
                    placeholderTextColor={Colors.text.tertiary}
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>
              </View>
            </>
          )}
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.inputRow}
            onPress={() => setShowRateOptions(!showRateOptions)}
          >
            <DollarSign size={20} color={Colors.primary} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Rate Type</Text>
              <Text style={styles.inputText}>
                {rateType === 'hourly' ? 'Hourly Rate' : 
                 selectedRate && user?.customRates ? 
                 user.customRates.find(r => r.id === selectedRate)?.title || 'Custom Rate' : 
                 'Custom Rate'}
              </Text>
            </View>
            {showRateOptions ? 
              <ChevronUp size={16} color={Colors.text.secondary} /> : 
              <ChevronDown size={16} color={Colors.text.secondary} />
            }
          </TouchableOpacity>
          
          {showRateOptions && (
            <View style={styles.rateOptionsContainer}>
              <TouchableOpacity
                style={[
                  styles.rateOption,
                  rateType === 'hourly' && styles.selectedRateOption
                ]}
                onPress={() => {
                  setRateType('hourly');
                  setSelectedRate(null);
                  setShowRateOptions(false);
                }}
              >
                <View style={styles.rateOptionContent}>
                  <Text style={styles.rateOptionTitle}>Hourly Rate</Text>
                  <Text style={styles.rateOptionAmount}>${user?.hourlyRate}/hour</Text>
                </View>
                {rateType === 'hourly' && (
                  <Check size={16} color={Colors.primary} />
                )}
              </TouchableOpacity>
              
              {user?.customRates?.map((rate) => (
                <TouchableOpacity
                  key={rate.id}
                  style={[
                    styles.rateOption,
                    rateType === 'custom' && selectedRate === rate.id && styles.selectedRateOption
                  ]}
                  onPress={() => {
                    setRateType('custom');
                    setSelectedRate(rate.id);
                    setShowRateOptions(false);
                  }}
                >
                  <View style={styles.rateOptionContent}>
                    <Text style={styles.rateOptionTitle}>{rate.title}</Text>
                    <Text style={styles.rateOptionAmount}>${rate.amount}</Text>
                  </View>
                  {rateType === 'custom' && selectedRate === rate.id && (
                    <Check size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <View style={styles.divider} />
          <View style={styles.inputRow}>
            <DollarSign size={20} color={Colors.primary} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Session Cost</Text>
              <TextInput
                style={styles.textInput}
                placeholder={`Suggested: $${calculateSessionCost().toFixed(2)}`}
                placeholderTextColor={Colors.text.tertiary}
                value={sessionCost}
                onChangeText={setSessionCost}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </Card>
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Session Notes</Text>
        
        <Card style={styles.card}>
          <TextInput
            style={styles.notesInput}
            placeholder="Add notes about the session (optional)"
            placeholderTextColor={Colors.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </Card>
        
        <View style={styles.buttonContainer}>
          <Button
            title={sessionId ? "Update Session" : "Schedule Session"}
            onPress={handleCreateSession}
            isLoading={isLoading}
            fullWidth
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerButton: {
    padding: 8,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  inputText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  placeholderText: {
    color: Colors.text.tertiary,
  },
  textInput: {
    fontSize: 16,
    color: Colors.text.primary,
    padding: 0,
    height: 24,
  },
  notesInput: {
    fontSize: 16,
    color: Colors.text.primary,
    padding: 16,
    minHeight: 120,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginLeft: 48,
  },
  datePicker: {
    backgroundColor: Colors.background.card,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 32,
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.text.secondary,
    transform: [{ rotate: '45deg' }],
  },
  pickerContainer: {
    backgroundColor: Colors.background.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  pickerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    marginLeft: 8,
  },
  rateOptionsContainer: {
    backgroundColor: Colors.background.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  rateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  selectedRateOption: {
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
  },
  rateOptionContent: {
    flex: 1,
  },
  rateOptionTitle: {
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  rateOptionAmount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});