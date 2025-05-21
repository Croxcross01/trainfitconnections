import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Dumbbell, Plus, Trash2, Info } from 'lucide-react-native';
import { useTrainerStore } from '@/store/trainer-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Exercise, WorkoutPlan, Client } from '@/types';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

export default function AddWorkoutPlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { createWorkoutPlan, clients } = useTrainerStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [exercises, setExercises] = useState<Partial<Exercise>[]>([
    { id: `temp-${Date.now()}`, name: '', description: '', sets: 3, reps: 10, restTime: '60 seconds' }
  ]);
  const [selectedClientId, setSelectedClientId] = useState(params.clientId as string || '');
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  
  // Load clients from store
  useEffect(() => {
    if (clients.length > 0) {
      setAvailableClients(clients);
    } else {
      // Fallback to mock clients if store is empty
      const mockClients = [
        { 
          id: 'c1', 
          name: 'Emma Wilson',
          email: 'emma@example.com',
          role: 'client' as const,
          profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
          goals: ['Weight Loss', 'Toning'],
          fitnessLevel: 'intermediate' as const,
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
          bio: 'Emma is a marketing professional looking to improve her fitness and lose weight.'
        },
        { 
          id: 'c2', 
          name: 'Michael Johnson',
          email: 'michael@example.com',
          role: 'client' as const,
          profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000',
          goals: ['Muscle Gain', 'Strength'],
          fitnessLevel: 'advanced' as const,
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
          bio: 'Michael is focused on building strength and muscle mass.'
        },
        { 
          id: 'c3', 
          name: 'Sarah Parker',
          email: 'sarah@example.com',
          role: 'client' as const,
          profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000',
          goals: ['Flexibility', 'Posture'],
          fitnessLevel: 'beginner' as const,
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
          bio: 'Sarah is new to fitness training and is primarily focused on improving her posture.'
        },
      ];
      setAvailableClients(mockClients);
    }
  }, [clients]);
  
  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { id: `temp-${Date.now()}`, name: '', description: '', sets: 3, reps: 10, restTime: '60 seconds' }
    ]);
  };
  
  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };
  
  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const updatedExercises = [...exercises];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setExercises(updatedExercises);
  };
  
  const handleDifficultySelect = (value: 'beginner' | 'intermediate' | 'advanced') => {
    setDifficulty(value);
  };
  
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
  };
  
  const handleCreatePlan = () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for the workout plan');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description for the workout plan');
      return;
    }
    
    if (!duration.trim()) {
      Alert.alert('Error', 'Please enter the duration for the workout plan');
      return;
    }
    
    if (!selectedClientId) {
      Alert.alert('Error', 'Please select a client for this workout plan');
      return;
    }
    
    // Validate exercises
    const invalidExercises = exercises.filter(ex => !ex.name || !ex.sets || !ex.reps);
    if (invalidExercises.length > 0) {
      Alert.alert('Error', 'Please complete all exercise details');
      return;
    }
    
    // Create workout plan
    const newWorkoutPlan: Omit<WorkoutPlan, 'id' | 'createdAt'> = {
      trainerId: user?.id || 't1',
      clientId: selectedClientId,
      title,
      description,
      exercises: exercises as Exercise[],
      duration,
      difficulty,
    };
    
    createWorkoutPlan(newWorkoutPlan);
    Alert.alert('Success', 'Workout plan created successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };
  
  return (
    <>
      <Stack.Screen options={{ title: 'Create Workout Plan' }} />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Plan Details</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <Input
            placeholder="e.g., Full Body Strength Training"
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the workout plan and its goals..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Duration</Text>
          <Input
            placeholder="e.g., 45-60 minutes"
            value={duration}
            onChangeText={setDuration}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                difficulty === 'beginner' && styles.difficultyButtonActive
              ]}
              onPress={() => handleDifficultySelect('beginner')}
            >
              <Text
                style={[
                  styles.difficultyButtonText,
                  difficulty === 'beginner' && styles.difficultyButtonTextActive
                ]}
              >
                Beginner
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                difficulty === 'intermediate' && styles.difficultyButtonActive
              ]}
              onPress={() => handleDifficultySelect('intermediate')}
            >
              <Text
                style={[
                  styles.difficultyButtonText,
                  difficulty === 'intermediate' && styles.difficultyButtonTextActive
                ]}
              >
                Intermediate
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.difficultyButton,
                difficulty === 'advanced' && styles.difficultyButtonActive
              ]}
              onPress={() => handleDifficultySelect('advanced')}
            >
              <Text
                style={[
                  styles.difficultyButtonText,
                  difficulty === 'advanced' && styles.difficultyButtonTextActive
                ]}
              >
                Advanced
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Client</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientsContainer}>
            {availableClients.map(client => (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientButton,
                  selectedClientId === client.id && styles.clientButtonActive
                ]}
                onPress={() => handleClientSelect(client.id)}
              >
                <Text
                  style={[
                    styles.clientButtonText,
                    selectedClientId === client.id && styles.clientButtonTextActive
                  ]}
                >
                  {client.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.exercisesHeader}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
            <Plus size={16} color={Colors.text.inverse} />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
        
        {exercises.map((exercise, index) => (
          <Card key={`exercise-${index}`} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNumberContainer}>
                <Text style={styles.exerciseNumber}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseInputContainer}>
                <Input
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChangeText={(value) => handleExerciseChange(index, 'name', value)}
                />
              </View>
              {exercises.length > 1 && (
                <TouchableOpacity
                  style={styles.removeExerciseButton}
                  onPress={() => handleRemoveExercise(index)}
                >
                  <Trash2 size={20} color={Colors.status.error} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.exerciseDetailsContainer}>
              <TextInput
                style={styles.exerciseDescription}
                placeholder="Brief description of the exercise..."
                value={exercise.description}
                onChangeText={(value) => handleExerciseChange(index, 'description', value)}
                multiline
                numberOfLines={2}
                placeholderTextColor={Colors.text.tertiary}
              />
              
              <View style={styles.exerciseMetrics}>
                <View style={styles.metricContainer}>
                  <Text style={styles.metricLabel}>Sets</Text>
                  <TextInput
                    style={styles.metricInput}
                    value={exercise.sets?.toString()}
                    onChangeText={(value) => handleExerciseChange(index, 'sets', parseInt(value) || 0)}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                
                <View style={styles.metricContainer}>
                  <Text style={styles.metricLabel}>Reps</Text>
                  <TextInput
                    style={styles.metricInput}
                    value={exercise.reps?.toString()}
                    onChangeText={(value) => handleExerciseChange(index, 'reps', parseInt(value) || 0)}
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
                
                <View style={styles.metricContainer}>
                  <Text style={styles.metricLabel}>Rest</Text>
                  <TextInput
                    style={styles.metricInput}
                    value={exercise.restTime}
                    onChangeText={(value) => handleExerciseChange(index, 'restTime', value)}
                    placeholderTextColor={Colors.text.tertiary}
                  />
                </View>
              </View>
            </View>
          </Card>
        ))}
        
        <View style={styles.tipContainer}>
          <Info size={16} color={Colors.primary} />
          <Text style={styles.tipText}>
            Add detailed instructions for each exercise to help your client perform them correctly.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Create Workout Plan"
            onPress={handleCreatePlan}
            fullWidth
            icon={<Dumbbell size={18} color={Colors.text.inverse} />}
          />
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
    paddingBottom: 40,
  },
  sectionTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 12,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    height: 100,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
    backgroundColor: Colors.background.card,
  },
  difficultyButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  difficultyButtonText: {
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  difficultyButtonTextActive: {
    color: Colors.text.inverse,
  },
  clientsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  clientButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: 8,
    backgroundColor: Colors.background.card,
  },
  clientButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  clientButtonText: {
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  clientButtonTextActive: {
    color: Colors.text.inverse,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addExerciseText: {
    color: Colors.text.inverse,
    fontWeight: '500',
    marginLeft: 4,
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
  },
  exerciseInputContainer: {
    flex: 1,
  },
  removeExerciseButton: {
    marginLeft: 8,
    padding: 4,
  },
  exerciseDetailsContainer: {
    marginLeft: 44,
  },
  exerciseDescription: {
    backgroundColor: Colors.background.dark,
    borderRadius: 8,
    padding: 12,
    color: Colors.text.primary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    textAlignVertical: 'top',
  },
  exerciseMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricContainer: {
    flex: 1,
    marginRight: 8,
  },
  metricLabel: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  metricInput: {
    backgroundColor: Colors.background.dark,
    borderRadius: 8,
    padding: 10,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  tipText: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },
});