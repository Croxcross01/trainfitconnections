import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Reminder, ReminderType } from '@/types';
import Colors from '@/constants/colors';
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Activity, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Info,
  Lightbulb
} from 'lucide-react-native';
import { formatTime } from '@/utils/time-format';

interface ReminderCardProps {
  reminder: Reminder;
  onPress: (reminder: Reminder) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onPress }) => {
  const getIcon = () => {
    switch (reminder.type) {
      case 'session_request':
        return <AlertCircle size={24} color={Colors.status.warning} />;
      case 'session_accepted':
        return <CheckCircle size={24} color={Colors.status.success} />;
      case 'session_declined':
        return <XCircle size={24} color={Colors.status.error} />;
      case 'session_cancelled':
        return <XCircle size={24} color={Colors.status.error} />;
      case 'session':
        return <Calendar size={24} color={Colors.primary} />;
      case 'workout':
      case 'workout_plan':
      case 'workout_plan_update':
        return <Activity size={24} color={Colors.secondary} />;
      case 'meal':
      case 'meal_plan':
      case 'meal_plan_update':
        return <Clock size={24} color={Colors.accent || Colors.status.info} />;
      case 'message':
        return <MessageSquare size={24} color={Colors.primary} />;
      case 'payment':
      case 'payment_update':
        return <Bell size={24} color={Colors.status.success} />;
      case 'tip':
        return <Lightbulb size={24} color="#FFD700" />;
      case 'general_update':
        return <Info size={24} color={Colors.status.info} />;
      default:
        return <Bell size={24} color={Colors.text.secondary} />;
    }
  };
  
  // Determine if this is a high priority notification
  const isHighPriority = reminder.type === 'session_request' && !reminder.isRead;
  
  // Determine if this is a non-interactive notification (tip or general update)
  const isNonInteractive = reminder.type === 'tip' || reminder.type === 'general_update';
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        !reminder.isRead && styles.unreadContainer,
        isHighPriority && styles.highPriorityContainer,
        isNonInteractive && styles.tipContainer
      ]}
      onPress={() => onPress(reminder)}
    >
      {reminder.type === 'message' && reminder.senderImage ? (
        <Image 
          source={{ uri: reminder.senderImage }} 
          style={styles.senderImage} 
        />
      ) : (
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[
            styles.title,
            isHighPriority && styles.highPriorityTitle,
            isNonInteractive && styles.tipTitle
          ]}>
            {reminder.title}
          </Text>
          <Text style={styles.time}>{formatTime(reminder.time)}</Text>
        </View>
        <Text 
          style={[
            styles.message,
            isNonInteractive && styles.tipMessage
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {reminder.message}
        </Text>
      </View>
      {!reminder.isRead && <View style={[
        styles.unreadIndicator,
        isHighPriority && styles.highPriorityIndicator,
        isNonInteractive && styles.tipIndicator
      ]} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background.dark,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadContainer: {
    backgroundColor: Colors.background.darker,
  },
  highPriorityContainer: {
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
    borderColor: Colors.status.warning,
  },
  tipContainer: {
    backgroundColor: 'rgba(66, 153, 225, 0.1)',
    borderColor: Colors.status.info,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  senderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  highPriorityTitle: {
    color: Colors.status.warning,
  },
  tipTitle: {
    color: Colors.status.info,
  },
  time: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  message: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  tipMessage: {
    fontStyle: 'italic',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    alignSelf: 'center',
    marginLeft: 8,
  },
  highPriorityIndicator: {
    backgroundColor: Colors.status.warning,
  },
  tipIndicator: {
    backgroundColor: Colors.status.info,
  },
});