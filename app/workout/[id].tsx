import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Dumbbell, Clock, CheckCircle, Info, User } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { useTrainerStore } from '@/store/trainer-store';
import { WorkoutPlan, Exercise } from '@/types';
import Colors from '@/constants/colors';

export default function WorkoutPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { workoutPlans, clients } = useTrainerStore();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [clientName, setClientName] = useState<string>('');
  
  useEffect(() => {
    // Try to find the workout plan in the store
    const foundPlan = workoutPlans.find(plan => plan.id === id);
    
    if (foundPlan) {
      setWorkoutPlan(foundPlan);
      
      // Find client name
      const client = clients.find(c => c.id === foundPlan.clientId);
      if (client) {
        setClientName(client.name);
      } else {
        setClientName('Unknown Client');
      }
    } else {
      // If not found, use mock data
      const mockWorkoutPlan: WorkoutPlan = {
        id: id || 'w1',
        trainerId: 't1',
        clientId: 'c1',
        title: 'Full Body Strength Training',
        description: 'A comprehensive workout plan targeting all major muscle groups for balanced strength development.',
        createdAt: new Date().toISOString(),
        duration: '45-60 minutes',
        difficulty: 'intermediate',
        exercises: [
          {
            id: 'e1',
            name: 'Barbell Squats',
            description: 'Focus on proper form, keep your back straight and go as low as comfortable.',
            sets: 4,
            reps: 10,
            restTime: '90 seconds'
          },
          {
            id: 'e2',
            name: 'Push-ups',
            description: 'Modify on knees if needed. Keep core engaged throughout the movement.',
            sets: 3,
            reps: 15,
            restTime: '60 seconds'
          },
          {
            id: 'e3',
            name: 'Dumbbell Rows',
            description: 'Pull the weight toward your hip, squeezing your shoulder blade at the top.',
            sets: 3,
            reps: 12,
            restTime: '60 seconds'
          },
          {
            id: 'e4',
            name: 'Deadlifts',
            description: 'Start with lighter weight to perfect form. Hinge at the hips, not the waist.',
            sets: 4,
            reps: 8,
            restTime: '90 seconds'
          },
          {
            id: 'e5',
            name: 'Plank',
            description: 'Hold position with core engaged. Modify on knees if needed.',
            sets: 3,
            reps: 0,
            restTime: '60 seconds'
          }
        ]
      };
      
      setWorkoutPlan(mockWorkoutPlan);
      setClientName('Emma Wilson');
    }
  }, [id, workoutPlans, clients]);
  
  if (!workoutPlan) {
    return null;
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} sec`;
    }
    return `${Math.floor(seconds / 60)} min`;
  };
  
  const handleMarkComplete = (exerciseId: string) => {
    Alert.alert('Success', 'Exercise marked as complete!');
  };
  
  return (
    <>
      <Stack.Screen options={{ title: workoutPlan.title }} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.headerCard}>
          <Text style={styles.title}>{workoutPlan.title}</Text>
          <Text style={styles.date}>Created on {formatDate(workoutPlan.createdAt)}</Text>
          
          {clientName && (
            <View style={styles.clientInfo}>
              <User size={16} color={Colors.primary} />
              <Text style={styles.clientName}>For: {clientName}</Text>
            </View>
          )}
          
          <Text style={styles.description}>{workoutPlan.description}</Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{workoutPlan.duration}</Text>
            </View>
            
            <View style={[
              styles.difficultyBadge,
              workoutPlan.difficulty === 'beginner' && styles.beginnerBadge,
              workoutPlan.difficulty === 'intermediate' && styles.intermediateBadge,
              workoutPlan.difficulty === 'advanced' && styles.advancedBadge,
            ]}>
              <Text style={styles.difficultyText}>
                {workoutPlan.difficulty.charAt(0).toUpperCase() + workoutPlan.difficulty.slice(1)}
              </Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <View style={styles.exerciseCount}>
            <Text style={styles.exerciseCountText}>{workoutPlan.exercises.length} exercises</Text>
          </View>
        </View>
        
        {workoutPlan.exercises.map((exercise, index) => (
          <Card key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNumberContainer}>
                <Text style={styles.exerciseNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
            </View>
            
            <View style={styles.exerciseDetails}>
              <View style={styles.exerciseDetail}>
                <Dumbbell size={16} color={Colors.primary} />
                <Text style={styles.exerciseDetailText}>
                  {exercise.sets} sets × {exercise.reps > 0 ? `${exercise.reps} reps` : 'hold'}
                </Text>
              </View>
              
              <View style={styles.exerciseDetail}>
                <Clock size={16} color={Colors.primary} />
                <Text style={styles.exerciseDetailText}>
                  Rest: {exercise.restTime}
                </Text>
              </View>
            </View>
            
            {exercise.description && (
              <View style={styles.notesContainer}>
                <Info size={14} color={Colors.text.secondary} />
                <Text style={styles.notesText}>{exercise.description}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => handleMarkComplete(exercise.id)}
            >
              <CheckCircle size={16} color={Colors.text.inverse} />
              <Text style={styles.completeButtonText}>Mark as Complete</Text>
            </TouchableOpacity>
          </Card>
        ))}
        
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Workout Tips</Text>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Warm up for 5-10 minutes before starting</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Rest 60-90 seconds between sets</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Stay hydrated throughout your workout</Text>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <Text style={styles.tipText}>Cool down and stretch after completing all exercises</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  contentContainer: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  beginnerBadge: {
    backgroundColor: Colors.secondary,
  },
  intermediateBadge: {
    backgroundColor: Colors.primary,
  },
  advancedBadge: {
    backgroundColor: Colors.status.info,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.inverse,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  exerciseCount: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  exerciseCountText: {
    color: Colors.text.inverse,
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseCard: {
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumber: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  exerciseDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  exerciseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseDetailText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  notesContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.darker,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  completeButtonText: {
    color: Colors.text.inverse,
    fontWeight: '500',
    marginLeft: 8,
  },
  tips: {
    marginTop: 8,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});