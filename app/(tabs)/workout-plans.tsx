import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Dumbbell, Search, Filter, Plus } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Input } from '@/components/Input';
import { PlanCard } from '@/components/PlanCard';
import { WorkoutPlan } from '@/types';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

export default function WorkoutPlansScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isLoading } = useClientStore();
  const { workoutPlans, clients } = useTrainerStore();
  const isTrainer = user?.role === "trainer";
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlans, setFilteredPlans] = useState<WorkoutPlan[]>([]);
  
  // Mock workout plans data
  const mockWorkoutPlans: WorkoutPlan[] = [
    {
      id: 'w1',
      trainerId: 't1',
      clientId: user?.id || 'c1',
      title: 'Full Body Strength Training',
      description: 'A comprehensive workout plan targeting all major muscle groups for balanced strength development.',
      exercises: [
        {
          id: 'e1',
          name: 'Barbell Squats',
          description: 'A compound exercise targeting the quadriceps, hamstrings, and glutes.',
          sets: 4,
          reps: 10,
          restTime: '90 seconds',
        },
        {
          id: 'e2',
          name: 'Push-ups',
          description: 'A bodyweight exercise targeting the chest, shoulders, and triceps.',
          sets: 3,
          reps: 15,
          restTime: '60 seconds',
        },
        {
          id: 'e3',
          name: 'Dumbbell Rows',
          description: 'An exercise targeting the back muscles and biceps.',
          sets: 3,
          reps: 12,
          restTime: '60 seconds',
        }
      ],
      duration: '45-60 minutes',
      difficulty: 'intermediate',
      createdAt: '2023-05-10T09:00:00Z'
    },
    {
      id: 'w2',
      trainerId: 't2',
      clientId: user?.id || 'c1',
      title: 'HIIT Cardio Circuit',
      description: 'High-intensity interval training to improve cardiovascular fitness and burn calories efficiently.',
      exercises: [
        {
          id: 'e1',
          name: 'Jumping Jacks',
          description: 'A full-body cardio exercise.',
          sets: 3,
          reps: 30,
          restTime: '30 seconds',
        },
        {
          id: 'e2',
          name: 'Mountain Climbers',
          description: 'A dynamic exercise targeting the core and cardiovascular system.',
          sets: 3,
          reps: 20,
          restTime: '30 seconds',
        },
        {
          id: 'e3',
          name: 'Burpees',
          description: 'A full-body exercise combining a squat, push-up, and jump.',
          sets: 3,
          reps: 15,
          restTime: '45 seconds',
        }
      ],
      duration: '30 minutes',
      difficulty: 'advanced',
      createdAt: '2023-06-15T14:30:00Z'
    },
    {
      id: 'w3',
      trainerId: 't1',
      clientId: user?.id || 'c1',
      title: 'Beginner Mobility Routine',
      description: 'A gentle routine focused on improving joint mobility and flexibility for beginners.',
      exercises: [
        {
          id: 'e1',
          name: 'Arm Circles',
          description: 'A shoulder mobility exercise.',
          sets: 2,
          reps: 10,
          restTime: '30 seconds',
        },
        {
          id: 'e2',
          name: 'Hip Rotations',
          description: 'An exercise to improve hip mobility.',
          sets: 2,
          reps: 10,
          restTime: '30 seconds',
        },
        {
          id: 'e3',
          name: 'Cat-Cow Stretch',
          description: 'A yoga-inspired movement for spine mobility.',
          sets: 2,
          reps: 10,
          restTime: '30 seconds',
        }
      ],
      duration: '20 minutes',
      difficulty: 'beginner',
      createdAt: '2023-07-20T08:15:00Z'
    }
  ];
  
  useEffect(() => {
    // Use real data if available, otherwise use mock data
    const plansData = workoutPlans.length > 0 ? workoutPlans : mockWorkoutPlans;
    
    if (searchQuery.trim() === '') {
      setFilteredPlans(plansData);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = plansData.filter(plan => 
        plan.title.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query)
      );
      setFilteredPlans(filtered);
    }
  }, [searchQuery, workoutPlans]);
  
  const handlePlanPress = (plan: WorkoutPlan) => {
    router.push(`/workout/${plan.id}`);
  };

  const handleAddWorkoutPlan = () => {
    router.push('/add-workout-plan');
  };
  
  // Get client name by ID
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  return (
    <View style={[layout.screen, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout Plans</Text>
        {isTrainer && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddWorkoutPlan}
          >
            <Plus size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        )}
        {!isTrainer && (
          <View style={styles.headerIcon}>
            <Dumbbell size={24} color={Colors.primary} />
          </View>
        )}
      </View>
      
      <Text style={styles.subtitle}>
        {isTrainer 
          ? "Create and manage workout plans for your clients" 
          : "Personalized workout plans designed by your trainers"
        }
      </Text>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            placeholder="Search workout plans..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ paddingLeft: 40 }}
          />
          <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredPlans.length > 0 ? (
        <FlatList
          data={filteredPlans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlanCard 
              plan={item} 
              type="workout" 
              onPress={handlePlanPress}
              clientName={isTrainer ? getClientName(item.clientId) : undefined}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Dumbbell size={40} color={Colors.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>No workout plans found</Text>
          <Text style={styles.emptyStateText}>
            {isTrainer 
              ? "Create workout plans for your clients to help them achieve their fitness goals."
              : "Try adjusting your search or ask your trainer to create a workout plan for you."
            }
          </Text>
          {isTrainer && (
            <TouchableOpacity
              style={styles.addPlanButton}
              onPress={handleAddWorkoutPlan}
            >
              <Text style={styles.addPlanText}>Create New Workout Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    ...typography.h3,
    color: Colors.text.primary,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  listContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addPlanButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addPlanText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
});