import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, User, Video, Home, Users, Star } from 'lucide-react-native';
import { Session } from '@/types';
import Colors from '@/constants/colors';
import { formatTime } from '@/utils/time-format';

interface SessionCardProps {
  session: Session;
  onPress: () => void;
  clientName?: string;
  trainerName?: string;
  isNewClient?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  onPress, 
  clientName, 
  trainerName,
  isNewClient = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return Colors.status.success;
      case 'pending':
        return Colors.status.warning;
      case 'completed':
        return Colors.status.info;
      case 'cancelled':
      case 'declined':
        return Colors.status.error;
      default:
        return Colors.text.secondary;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'declined':
        return 'Declined';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'one-on-one':
        return <User size={16} color={Colors.text.secondary} />;
      case 'virtual':
        return <Video size={16} color={Colors.text.secondary} />;
      case 'house-call':
        return <Home size={16} color={Colors.text.secondary} />;
      case 'group':
        return <Users size={16} color={Colors.text.secondary} />;
      default:
        return <User size={16} color={Colors.text.secondary} />;
    }
  };
  
  const sessionDate = new Date(session.date);
  const formattedDate = sessionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(session.startTime)}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.typeContainer}>
            {getSessionTypeIcon(session.type)}
            <Text style={styles.type}>
              {session.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(session.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
              {getStatusText(session.status)}
            </Text>
          </View>
        </View>
        
        {(clientName || trainerName) && (
          <View style={styles.personRow}>
            <User size={14} color={Colors.text.secondary} style={styles.icon} />
            <Text style={styles.personName}>
              {clientName || trainerName}
              {isNewClient && (
                <Text style={styles.newClientBadge}> • <Star size={12} color={Colors.status.warning} /> New Client</Text>
              )}
            </Text>
          </View>
        )}
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Clock size={14} color={Colors.text.secondary} style={styles.icon} />
            <Text style={styles.detailText}>
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </Text>
          </View>
          
          {session.location && session.location.address && (
            <View style={styles.detailItem}>
              <MapPin size={14} color={Colors.text.secondary} style={styles.icon} />
              <Text style={styles.detailText} numberOfLines={1}>
                {session.location.address}
              </Text>
            </View>
          )}
        </View>
        
        {session.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {session.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  timeContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border.light,
    marginHorizontal: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  type: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  personName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  newClientBadge: {
    color: Colors.status.warning,
    fontWeight: '500',
  },
  detailsRow: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  notes: {
    fontSize: 13,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
});