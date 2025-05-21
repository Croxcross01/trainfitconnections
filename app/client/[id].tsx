import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Calendar, Edit, MessageSquare, Phone, Mail, MapPin, Award, Activity, Clock, Dumbbell, Utensils } from 'lucide-react-native';
import { useTrainerStore } from '@/store/trainer-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Client, WorkoutPlan, MealPlan } from '@/types';
import Colors from '@/constants/colors';
import { layout } from '@/styles/layout';
import { trpc } from '@/lib/trpc';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { clients, workoutPlans, mealPlans } = useTrainerStore();
  const [client, setClient] = useState<Client | null>(null);
  const [clientWorkoutPlans, setClientWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [clientMealPlans, setClientMealPlans] = useState<MealPlan[]>([]);
  
  // Use tRPC mutation for sending messages
  const sendMessageMutation = trpc.messages.sendMessage.useMutation();
  
  // Redirect non-trainers away from this page
  useEffect(() => {
    if (user?.role !== 'trainer') {
      router.replace('/');
      return;
    }
    
    // Find client by ID from store
    let foundClient = clients.find(c => c.id === id);
    
    // If not found in store, check mock data
    if (!foundClient) {
      const mockClients: Client[] = [
        {
          id: 'c1',
          name: 'Emma Wilson',
          email: 'emma@example.com',
          role: 'client',
          profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
          goals: ['Weight Loss', 'Toning'],
          fitnessLevel: 'intermediate',
          location: {
            latitude: 30.2672,
            longitude: -97.7431,
            address: 'Austin, TX'
          },
          healthInfo: {
            height: 165,
            weight: 62,
            medicalConditions: ['None']
          },
          bio: 'Emma is a marketing professional looking to improve her fitness and lose weight. She enjoys outdoor activities and has been consistent with her training schedule.'
        },
        {
          id: 'c2',
          name: 'Michael Brown',
          email: 'michael@example.com',
          role: 'client',
          profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000',
          goals: ['Muscle Gain', 'Strength'],
          fitnessLevel: 'advanced',
          location: {
            latitude: 30.2982,
            longitude: -97.7431,
            address: 'Austin, TX'
          },
          healthInfo: {
            height: 180,
            weight: 75,
            medicalConditions: ['None']
          },
          bio: 'Michael is a software engineer who has been training for several years. He is focused on building strength and muscle mass, and is dedicated to his nutrition plan.'
        },
        {
          id: 'c3',
          name: 'Sophia Chen',
          email: 'sophia@example.com',
          role: 'client',
          profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000',
          goals: ['Flexibility', 'Posture'],
          fitnessLevel: 'beginner',
          location: {
            latitude: 30.2512,
            longitude: -97.7531,
            address: 'Austin, TX'
          },
          healthInfo: {
            height: 160,
            weight: 55,
            medicalConditions: ['Mild back pain']
          },
          bio: 'Sophia is new to fitness training and is primarily focused on improving her posture and flexibility. She works as a graphic designer and spends long hours at her desk.'
        },
      ];
      
      foundClient = mockClients.find(c => c.id === id);
    }
    
    if (foundClient) {
      setClient(foundClient);
    }
  }, [id, user, router, clients]);
  
  // Load client's workout and meal plans
  useEffect(() => {
    if (client) {
      // Filter workout plans for this client
      const clientWPs = workoutPlans.filter(plan => plan.clientId === client.id);
      setClientWorkoutPlans(clientWPs);
      
      // Filter meal plans for this client
      const clientMPs = mealPlans.filter(plan => plan.clientId === client.id);
      setClientMealPlans(clientMPs);
    }
  }, [client, workoutPlans, mealPlans]);
  
  if (!client) {
    return null;
  }
  
  const getLevelColor = (level: string | undefined) => {
    switch (level) {
      case 'beginner':
        return Colors.secondary;
      case 'intermediate':
        return Colors.primary;
      case 'advanced':
        return Colors.status.info;
      default:
        return Colors.primary;
    }
  };
  
  const handleScheduleSession = () => {
    router.push({
      pathname: '/new-session',
      params: { clientId: client.id }
    });
  };
  
  const handleCreateWorkoutPlan = () => {
    router.push({
      pathname: '/add-workout-plan',
      params: { clientId: client.id }
    });
  };
  
  const handleCreateMealPlan = () => {
    router.push({
      pathname: '/add-meal-plan',
      params: { clientId: client.id }
    });
  };
  
  const handleEditClient = () => {
    router.push({
      pathname: '/edit-client',
      params: { clientId: client.id }
    });
  };
  
  const handleMessageClient = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }
    
    // First check if there's an existing conversation
    router.push({
      pathname: '/messages/chat',
      params: { 
        recipientId: client.id,
        recipientName: client.name,
        recipientImage: client.profileImage || ''
      }
    });
  };
  
  const handleViewWorkoutPlan = (planId: string) => {
    router.push({
      pathname: `/workout/${planId}`
    });
  };
  
  const handleViewMealPlan = (planId: string) => {
    router.push({
      pathname: `/meal/${planId}`
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen 
        options={{
          title: 'Client Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleEditClient} style={styles.editButton}>
              <Edit size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: client.profileImage }} 
          style={styles.profileImage} 
        />
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{client.name}</Text>
          <Text style={styles.email}>{client.email}</Text>
          
          <View style={styles.levelBadgeContainer}>
            {client.fitnessLevel && (
              <View 
                style={[
                  styles.levelBadge, 
                  { backgroundColor: getLevelColor(client.fitnessLevel) }
                ]}
              >
                <Text style={styles.levelText}>
                  {client.fitnessLevel.charAt(0).toUpperCase() + client.fitnessLevel.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {client.bio && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{client.bio}</Text>
        </Card>
      )}
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Goals</Text>
        <View style={styles.goalsContainer}>
          {client.goals?.map((goal, index) => (
            <View key={index} style={styles.goalBadge}>
              <Award size={16} color={Colors.primary} style={styles.goalIcon} />
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
        </View>
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.contactItem}>
          <Mail size={18} color={Colors.text.secondary} style={styles.contactIcon} />
          <Text style={styles.contactText}>{client.email}</Text>
        </View>
        {client.location && (
          <View style={styles.contactItem}>
            <MapPin size={18} color={Colors.text.secondary} style={styles.contactIcon} />
            <Text style={styles.contactText}>{client.location.address}</Text>
          </View>
        )}
      </Card>
      
      {client.healthInfo && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <View style={styles.healthInfoContainer}>
            {client.healthInfo.height && (
              <View style={styles.healthInfoItem}>
                <Text style={styles.healthInfoLabel}>Height</Text>
                <Text style={styles.healthInfoValue}>{client.healthInfo.height} cm</Text>
              </View>
            )}
            {client.healthInfo.weight && (
              <View style={styles.healthInfoItem}>
                <Text style={styles.healthInfoLabel}>Weight</Text>
                <Text style={styles.healthInfoValue}>{client.healthInfo.weight} kg</Text>
              </View>
            )}
          </View>
          
          {client.healthInfo.medicalConditions && client.healthInfo.medicalConditions.length > 0 && (
            <View style={styles.medicalContainer}>
              <Text style={styles.healthInfoLabel}>Medical Conditions</Text>
              {client.healthInfo.medicalConditions.map((condition, index) => (
                <Text key={index} style={styles.medicalCondition}>• {condition}</Text>
              ))}
            </View>
          )}
        </Card>
      )}
      
      {/* Client's Workout Plans */}
      {clientWorkoutPlans.length > 0 && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workout Plans</Text>
            <TouchableOpacity onPress={handleCreateWorkoutPlan}>
              <Text style={styles.seeAllText}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          {clientWorkoutPlans.map((plan) => (
            <TouchableOpacity 
              key={plan.id} 
              style={styles.planItem}
              onPress={() => handleViewWorkoutPlan(plan.id)}
            >
              <View style={styles.planIconContainer}>
                <Dumbbell size={20} color={Colors.primary} />
              </View>
              <View style={styles.planContent}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planDate}>Created {formatDate(plan.createdAt)}</Text>
              </View>
              <View style={styles.planDifficulty}>
                <Text style={[
                  styles.planDifficultyText,
                  plan.difficulty === 'beginner' && styles.beginnerText,
                  plan.difficulty === 'intermediate' && styles.intermediateText,
                  plan.difficulty === 'advanced' && styles.advancedText,
                ]}>
                  {plan.difficulty.charAt(0).toUpperCase() + plan.difficulty.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      )}
      
      {/* Client's Meal Plans */}
      {clientMealPlans.length > 0 && (
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meal Plans</Text>
            <TouchableOpacity onPress={handleCreateMealPlan}>
              <Text style={styles.seeAllText}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          {clientMealPlans.map((plan) => (
            <TouchableOpacity 
              key={plan.id} 
              style={styles.planItem}
              onPress={() => handleViewMealPlan(plan.id)}
            >
              <View style={styles.planIconContainer}>
                <Utensils size={20} color={Colors.primary} />
              </View>
              <View style={styles.planContent}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planDate}>Created {formatDate(plan.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      )}
      
      <View style={styles.actionsContainer}>
        <Button 
          title="Schedule Session" 
          onPress={handleScheduleSession}
          icon={<Calendar size={18} color={Colors.text.inverse} />}
          style={styles.actionButton}
          fullWidth
        />
        
        <View style={styles.actionRow}>
          <Button 
            title="Create Workout Plan" 
            onPress={handleCreateWorkoutPlan}
            icon={<Activity size={18} color={Colors.text.inverse} />}
            style={[styles.actionButton, styles.halfButton]}
            size="small"
          />
          
          <Button 
            title="Create Meal Plan" 
            onPress={handleCreateMealPlan}
            icon={<Clock size={18} color={Colors.text.inverse} />}
            style={[styles.actionButton, styles.halfButton]}
            size="small"
          />
        </View>
        
        <Button 
          title="Message Client" 
          onPress={handleMessageClient}
          icon={<MessageSquare size={18} color={Colors.primary} />}
          variant="outline"
          style={styles.actionButton}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  editButton: {
    padding: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  levelBadgeContainer: {
    flexDirection: 'row',
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  bioText: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  goalIcon: {
    marginRight: 6,
  },
  goalText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  healthInfoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  healthInfoItem: {
    flex: 1,
  },
  healthInfoLabel: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  healthInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  medicalContainer: {
    marginTop: 8,
  },
  medicalCondition: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  planIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planContent: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  planDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  planDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  planDifficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
  },
  beginnerText: {
    color: Colors.secondary,
  },
  intermediateText: {
    color: Colors.primary,
  },
  advancedText: {
    color: Colors.status.info,
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfButton: {
    flex: 0.48,
  },
});