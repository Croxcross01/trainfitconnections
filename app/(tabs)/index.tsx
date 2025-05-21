import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Dumbbell, Utensils, Calendar, ArrowRight, Users, Video, Camera, MapPin, RefreshCw, Info } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { Session, Trainer } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user, debugUsers } = useAuthStore();
  const { 
    nearbyTrainers, 
    favoriteTrainers, 
    sessions: clientSessions,
    fetchNearbyTrainers,
    debugTrainers
  } = useClientStore();
  const { 
    clients, 
    sessions: trainerSessions,
    photos
  } = useTrainerStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isTrainer = user?.role === 'trainer';
  
  // Get current time to display appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (!isTrainer && user) {
          // Load client data
          if (user.location) {
            await fetchNearbyTrainers(user.location.latitude, user.location.longitude);
          }
        }
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isTrainer, user]);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (!isTrainer && user?.location) {
        await fetchNearbyTrainers(user.location.latitude, user.location.longitude);
        Alert.alert("Refreshed", "Home data has been refreshed with the latest information.");
      }
    } catch (error) {
      console.error('Error refreshing home data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Get today's sessions
  const getTodaySessions = () => {
    const today = new Date().toISOString().split('T')[0];
    const sessions = isTrainer ? trainerSessions : clientSessions;
    
    return sessions
      .filter(session => {
        const sessionDate = new Date(session.date).toISOString().split('T')[0];
        return sessionDate === today && session.status === 'scheduled';
      })
      .sort((a, b) => {
        // Sort by start time
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        
        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0];
        }
        return timeA[1] - timeB[1];
      })
      .slice(0, 2); // Get only the first 2 sessions
  };
  
  // Get favorite trainers
  const getFavoriteTrainers = () => {
    return nearbyTrainers.filter(trainer => 
      favoriteTrainers.includes(trainer.id)
    ).slice(0, 3); // Get only the first 3 favorite trainers
  };
  
  // Navigate to different sections
  const navigateToWorkoutPlans = () => {
    router.push('/(tabs)/workout-plans');
  };
  
  const navigateToMealPlans = () => {
    router.push('/(tabs)/meal-plans');
  };
  
  const navigateToSchedule = () => {
    router.push('/(tabs)/schedule');
  };
  
  const navigateToClients = () => {
    router.push('/(tabs)/clients');
  };
  
  const navigateToTrainerMap = () => {
    router.push('/trainer-map');
  };
  
  const navigateToTrainers = () => {
    router.push('/(tabs)/my-trainers');
  };
  
  const navigateToVideos = () => {
    router.push('/trainer/videos');
  };
  
  const navigateToPhotos = () => {
    router.push('/trainer/photos');
  };
  
  const navigateToTrainerProfile = (trainerId: string) => {
    router.push(`/trainer/${trainerId}`);
  };
  
  const navigateToSessionDetails = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
  };
  
  // Show debug info
  const showDebugInfo = () => {
    if (isTrainer) {
      debugUsers();
    } else {
      debugTrainers();
    }
  };
  
  const todaySessions = getTodaySessions();
  const favoriteTrainersList = getFavoriteTrainers();
  
  // Render session card
  const renderSessionCard = (session: Session) => {
    const sessionTime = session.startTime;
    const sessionClient = isTrainer 
      ? clients.find(c => c.id === session.clientId)?.name || 'Client'
      : nearbyTrainers.find(t => t.id === session.trainerId)?.name || 'Trainer';
    
    return (
      <Card key={session.id} style={styles.sessionCard} onPress={() => navigateToSessionDetails(session.id)}>
        <View style={styles.sessionTime}>
          <Text style={styles.sessionTimeText}>{sessionTime}</Text>
          <Text style={styles.sessionDateText}>Today</Text>
        </View>
        
        <View style={styles.sessionDetails}>
          <Text style={styles.sessionTitle}>{session.type === 'one-on-one' ? 'Personal Training' : 
                                             session.type === 'group' ? 'Group Session' : 
                                             session.type === 'virtual' ? 'Virtual Session' : 
                                             session.type === 'house-call' ? 'House Call' : 
                                             'Training Session'}</Text>
          <Text style={styles.sessionClient}>with {sessionClient}</Text>
          <View style={styles.sessionType}>
            <Text style={styles.sessionTypeText}>{
              session.type === 'virtual' ? 'Virtual' : 
              session.type === 'house-call' ? 'House Call' : 
              session.type === 'group' ? 'Group' : 'In-Person'
            }</Text>
          </View>
        </View>
      </Card>
    );
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
        </View>
        
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={onRefresh}
        disabled={refreshing}
      >
        <RefreshCw size={16} color={Colors.primary} style={refreshing ? styles.refreshingIcon : {}} />
        <Text style={styles.refreshButtonText}>
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </Text>
      </TouchableOpacity>
      
      {isTrainer ? (
        // Trainer Home Screen
        <>
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{clients.length}</Text>
              <Text style={styles.statLabel}>Active Clients</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{todaySessions.length}</Text>
              <Text style={styles.statLabel}>Sessions Today</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{user?.rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </Card>
          </View>
          
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickAction} onPress={navigateToSchedule}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Calendar size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionText}>Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={navigateToClients}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Users size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionText}>Clients</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={navigateToWorkoutPlans}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
                <Dumbbell size={24} color="#059669" />
              </View>
              <Text style={styles.quickActionText}>Workouts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction} onPress={navigateToMealPlans}>
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Utensils size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickActionText}>Meal Plans</Text>
            </TouchableOpacity>
          </View>
          
          {todaySessions.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                <TouchableOpacity onPress={navigateToSchedule}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {todaySessions.map(renderSessionCard)}
            </>
          ) : (
            <Card style={styles.emptySessionsCard}>
              <Text style={styles.emptySessionsTitle}>No Sessions Today</Text>
              <Text style={styles.emptySessionsText}>
                You don't have any scheduled sessions for today. Use this time to prepare content or reach out to clients.
              </Text>
              <Button
                title="Schedule a Session"
                onPress={() => router.push('/new-session')}
                variant="primary"
                size="small"
                style={styles.emptySessionsButton}
              />
            </Card>
          )}
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Content Management</Text>
          </View>
          
          <View style={styles.contentManagementContainer}>
            <TouchableOpacity style={styles.contentCard} onPress={navigateToVideos}>
              <View style={styles.contentCardIcon}>
                <Video size={24} color={Colors.primary} />
              </View>
              <Text style={styles.contentCardTitle}>Videos</Text>
              <Text style={styles.contentCardDescription}>Manage your video content</Text>
              <ArrowRight size={16} color={Colors.text.secondary} style={styles.contentCardArrow} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contentCard} onPress={navigateToPhotos}>
              <View style={styles.contentCardIcon}>
                <Camera size={24} color={Colors.primary} />
              </View>
              <Text style={styles.contentCardTitle}>Photos</Text>
              <Text style={styles.contentCardDescription}>
                {photos.length > 0 ? `${photos.length} photos uploaded` : 'Add your first photo'}
              </Text>
              <ArrowRight size={16} color={Colors.text.secondary} style={styles.contentCardArrow} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Client Home Screen
        <>
          <Card style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome to TrainFit!</Text>
            <Text style={styles.welcomeText}>
              Track your workouts, nutrition, and connect with professional trainers all in one place.
            </Text>
            <Button
              title="Find a Trainer"
              onPress={navigateToTrainerMap}
              variant="primary"
              size="small"
              icon={<MapPin size={16} color={Colors.text.inverse} />}
              iconPosition="left"
              style={styles.welcomeButton}
            />
          </Card>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Plans</Text>
          </View>
          
          <View style={styles.plansContainer}>
            <TouchableOpacity style={styles.planCard} onPress={navigateToWorkoutPlans}>
              <View style={[styles.planCardIcon, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
                <Dumbbell size={24} color="#059669" />
              </View>
              <View style={styles.planCardContent}>
                <Text style={styles.planCardTitle}>Workout Plans</Text>
                <Text style={styles.planCardDescription}>View your personalized workout routines</Text>
              </View>
              <ArrowRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.planCard} onPress={navigateToMealPlans}>
              <View style={[styles.planCardIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Utensils size={24} color="#F59E0B" />
              </View>
              <View style={styles.planCardContent}>
                <Text style={styles.planCardTitle}>Meal Plans</Text>
                <Text style={styles.planCardDescription}>Check your nutrition and meal schedules</Text>
              </View>
              <ArrowRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          {todaySessions.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                <TouchableOpacity onPress={navigateToSchedule}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              {todaySessions.map(renderSessionCard)}
            </>
          ) : (
            <Card style={styles.emptySessionsCard}>
              <Text style={styles.emptySessionsTitle}>No Sessions Today</Text>
              <Text style={styles.emptySessionsText}>
                You don't have any scheduled sessions for today. Book a session with a trainer to get started.
              </Text>
              <Button
                title="Book a Session"
                onPress={navigateToTrainerMap}
                variant="primary"
                size="small"
                style={styles.emptySessionsButton}
              />
            </Card>
          )}
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Trainers</Text>
            <TouchableOpacity onPress={navigateToTrainers}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {favoriteTrainersList.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trainersContainer}>
              {favoriteTrainersList.map((trainer) => (
                <TouchableOpacity 
                  key={trainer.id}
                  style={styles.trainerCard} 
                  onPress={() => navigateToTrainerProfile(trainer.id)}
                >
                  <Image
                    source={{ uri: trainer.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000' }}
                    style={styles.trainerImage}
                  />
                  <Text style={styles.trainerName}>{trainer.name}</Text>
                  <Text style={styles.trainerSpecialty}>
                    {trainer.specialties && trainer.specialties.length > 0 
                      ? trainer.specialties[0] 
                      : 'Personal Trainer'}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity 
                style={styles.findMoreTrainersCard}
                onPress={navigateToTrainerMap}
              >
                <View style={styles.findMoreTrainersIcon}>
                  <Users size={24} color={Colors.primary} />
                </View>
                <Text style={styles.findMoreTrainersText}>Find More Trainers</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <Card style={styles.emptyTrainersCard}>
              <Text style={styles.emptyTrainersTitle}>No Trainers Yet</Text>
              <Text style={styles.emptyTrainersText}>
                You haven't added any trainers to your favorites yet. Find trainers to get personalized workout plans.
              </Text>
              <Button
                title="Find Trainers"
                onPress={navigateToTrainerMap}
                variant="primary"
                size="small"
                style={styles.emptyTrainersButton}
              />
            </Card>
          )}
          
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              {nearbyTrainers.length} trainers available ({favoriteTrainersList.length} favorites)
            </Text>
          </View>
        </>
      )}
      
      {/* Debug button */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={showDebugInfo}
      >
        <Info size={16} color={Colors.text.tertiary} />
        <Text style={styles.debugButtonText}>Debug User Info</Text>
      </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.dark,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.secondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    ...typography.bodyLarge,
    color: Colors.text.secondary,
  },
  name: {
    ...typography.h3,
    color: Colors.text.primary,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImagePlaceholderText: {
    color: Colors.text.inverse,
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderRadius: 8,
  },
  refreshButtonText: {
    ...typography.bodyMedium,
    color: Colors.primary,
    marginLeft: 8,
  },
  refreshingIcon: {
    transform: [{ rotate: '45deg' }],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
  },
  statValue: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
  },
  sectionTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    ...typography.bodyMedium,
    color: Colors.primary,
  },
  sessionCard: {
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },
  sessionTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 70,
  },
  sessionTimeText: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  sessionDateText: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionClient: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  sessionType: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  sessionTypeText: {
    ...typography.bodySmall,
    color: Colors.primary,
    fontWeight: '500',
  },
  contentManagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  contentCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  contentCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  contentCardTitle: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentCardDescription: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  contentCardArrow: {
    alignSelf: 'flex-end',
  },
  welcomeCard: {
    marginBottom: 24,
    padding: 20,
  },
  welcomeTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  welcomeText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  welcomeButton: {
    alignSelf: 'flex-start',
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  planCardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planCardContent: {
    flex: 1,
  },
  planCardTitle: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  planCardDescription: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
  },
  trainersContainer: {
    marginBottom: 24,
  },
  trainerCard: {
    width: 150,
    marginRight: 16,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  trainerImage: {
    width: '100%',
    height: 150,
  },
  trainerName: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
    marginTop: 12,
    marginHorizontal: 12,
  },
  trainerSpecialty: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 12,
    marginHorizontal: 12,
  },
  findMoreTrainersCard: {
    width: 150,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderStyle: 'dashed',
  },
  findMoreTrainersIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  findMoreTrainersText: {
    ...typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  emptySessionsCard: {
    marginBottom: 24,
    padding: 20,
    alignItems: 'center',
  },
  emptySessionsTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySessionsText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptySessionsButton: {
    alignSelf: 'center',
  },
  emptyTrainersCard: {
    marginBottom: 24,
    padding: 20,
    alignItems: 'center',
  },
  emptyTrainersTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyTrainersText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyTrainersButton: {
    alignSelf: 'center',
  },
  debugInfo: {
    padding: 8,
    backgroundColor: Colors.background.darker,
    borderRadius: 8,
    marginTop: 8,
  },
  debugText: {
    color: Colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.darker,
    alignSelf: 'center',
    marginTop: 16,
  },
  debugButtonText: {
    color: Colors.text.tertiary,
    fontSize: 12,
    marginLeft: 4,
  },
});