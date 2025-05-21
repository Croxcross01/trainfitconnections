import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { useTrainerStore } from '@/store/trainer-store';
import { SessionCard } from '@/components/SessionCard';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { Session, Client } from '@/types';

export default function ScheduleScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { sessions: clientSessions, nearbyTrainers } = useClientStore();
  const { sessions: trainerSessions, clients: trainerClients } = useTrainerStore();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'pending'>('all');
  
  const isTrainer = user?.role === 'trainer';
  const sessions = isTrainer ? trainerSessions : clientSessions;
  const clients = isTrainer ? trainerClients : [];
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format date for filtering
  const formatDateForFilter = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };
  
  // Navigate to next day
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };
  
  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };
  
  // Filter sessions based on selected date and filter
  const getFilteredSessions = () => {
    const dateString = formatDateForFilter(selectedDate);
    
    return sessions.filter(session => {
      const sessionDate = new Date(session.date).toISOString().split('T')[0];
      
      // Filter by date
      if (sessionDate !== dateString) {
        return false;
      }
      
      // Filter by status
      if (filter === 'upcoming') {
        return session.status === 'scheduled';
      } else if (filter === 'completed') {
        return session.status === 'completed';
      } else if (filter === 'pending') {
        return session.status === 'pending';
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by start time
      const timeA = a.startTime.split(':').map(Number);
      const timeB = b.startTime.split(':').map(Number);
      
      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    });
  };
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    
    // Log current sessions for debugging
    console.log(`Refreshing schedule. Current sessions: ${sessions.length}`);
    console.log(`Sessions with 'scheduled' status: ${sessions.filter(s => s.status === 'scheduled').length}`);
    
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
  };
  
  // Navigate to session details
  const navigateToSessionDetails = (session: Session) => {
    router.push(`/session/${session.id}`);
  };
  
  // Navigate to create new session
  const navigateToNewSession = () => {
    router.push('/new-session');
  };
  
  // Navigate to book session
  const navigateToBookSession = () => {
    router.push('/book-session');
  };
  
  const filteredSessions = getFilteredSessions();
  
  // Get client or trainer name for a session
  const getNameForSession = (session: Session) => {
    if (isTrainer) {
      const client = clients.find((c: Client) => c.id === session.clientId);
      return client?.name;
    } else {
      const trainer = nearbyTrainers.find(t => t.id === session.trainerId);
      return trainer?.name;
    }
  };
  
  // Check if this is a new client session
  const isNewClientSession = (session: Session) => {
    if (!isTrainer) return false;
    
    // Check if the session has the isNewClient flag
    if ('isNewClient' in session && session.isNewClient) {
      return true;
    }
    
    // Or check if the client has only this session
    const client = clients.find(c => c.id === session.clientId);
    return client && (client.sessionCount === 1 || client.sessionCount === 0);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousDay} style={styles.navButton}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
          <Calendar size={16} color={Colors.primary} />
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToNextDay} style={styles.navButton}>
          <ChevronRight size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterButtonText, filter === 'upcoming' && styles.filterButtonTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterButtonText, filter === 'pending' && styles.filterButtonTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      ) : filteredSessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Sessions</Text>
          <Text style={styles.emptyText}>
            {filter !== 'all' 
              ? `You don't have any ${filter} sessions for this day.` 
              : "You don't have any sessions scheduled for this day."}
          </Text>
          
          <Button
            title={isTrainer ? "Schedule a Session" : "Book a Session"}
            onPress={isTrainer ? navigateToNewSession : navigateToBookSession}
            variant="primary"
            size="small"
            icon={<Plus size={16} color={Colors.text.inverse} />}
            iconPosition="left"
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredSessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onPress={() => navigateToSessionDetails(item)}
              clientName={isTrainer ? getNameForSession(item) : undefined}
              trainerName={!isTrainer ? getNameForSession(item) : undefined}
              isNewClient={isNewClientSession(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={isTrainer ? navigateToNewSession : navigateToBookSession}
      >
        <Plus size={24} color={Colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateText: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  filterButtonTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.secondary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});