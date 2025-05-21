import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X, Plus, Trash2, Users, Utensils, Clock } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { Client } from '@/types';
import { formatTimeInput, formatTo24Hour } from '@/utils/time-format';

type Meal = {
  id: string;
  name: string;
  time: string;
  description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};

export default function AddMealPlanScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const trainerStore = useTrainerStore();
  
  // Check if user is a trainer
  const isTrainer = user?.role === 'trainer';
  
  // Redirect if not a trainer
  React.useEffect(() => {
    if (!isTrainer) {
      Alert.alert(
        'Access Denied',
        'Only trainers can create meal plans',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [isTrainer, router]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: `meal-${Date.now()}`,
      name: 'Breakfast',
      time: '8:00 AM',
      description: '',
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
    }
  ]);
  
  // Validation states
  const [titleError, setTitleError] = useState('');
  const [clientError, setClientError] = useState('');
  
  // Get real clients from the trainer store
  const clients = trainerStore.clients || [];
  
  const addMeal = () => {
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      name: '',
      time: '',
      description: '',
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
    };
    
    setMeals([...meals, newMeal]);
  };
  
  const removeMeal = (id: string) => {
    if (meals.length <= 1) {
      Alert.alert('Cannot Remove', 'A meal plan must have at least one meal');
      return;
    }
    
    setMeals(meals.filter(meal => meal.id !== id));
  };
  
  const updateMeal = (id: string, field: keyof Meal, value: any) => {
    setMeals(meals.map(meal => {
      if (meal.id === id) {
        // Special handling for time field to ensure proper format
        if (field === 'time') {
          const formattedTime = formatTimeInput(value);
          return { ...meal, [field]: formattedTime };
        }
        return { ...meal, [field]: value };
      }
      return meal;
    }));
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Title is required');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (!selectedClient) {
      setClientError('Please select a client');
      isValid = false;
    } else {
      setClientError('');
    }
    
    // Check if all meals have a name and time
    const invalidMeals = meals.some(meal => !meal.name.trim() || !meal.time.trim());
    if (invalidMeals) {
      Alert.alert('Incomplete Meals', 'All meals must have a name and time');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleCreateMealPlan = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Convert all meal times to 24-hour format for storage
    const processedMeals = meals.map(meal => ({
      ...meal,
      time: formatTo24Hour(meal.time)
    }));
    
    // Create new meal plan object
    const newMealPlan = {
      id: `mp${Date.now()}`,
      trainerId: user?.id || 't1',
      clientId: selectedClient,
      title,
      description,
      meals: processedMeals,
      createdAt: new Date().toISOString()
    };
    
    // Simulate API call
    setTimeout(() => {
      // Add meal plan to store
      trainerStore.createMealPlan(newMealPlan);
      
      setIsLoading(false);
      Alert.alert(
        'Success',
        'Meal plan created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }, 1000);
  };
  
  const getSelectedClientName = () => {
    const client = clients.find(c => c.id === selectedClient);
    return client ? client.name : 'Select Client';
  };
  
  if (!isTrainer) {
    return null; // Don't render anything if not a trainer
  }
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Create Meal Plan",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Meal Plan Details</Text>
        
        <Card style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Title</Text>
            <Input
              placeholder="Enter meal plan title"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (text.trim()) setTitleError('');
              }}
              error={titleError}
              leftIcon={<Utensils size={20} color={Colors.text.secondary} />}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter a description of this meal plan"
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Client</Text>
            <TouchableOpacity 
              style={[styles.clientSelector, clientError ? styles.errorBorder : null]}
              onPress={() => setShowClientPicker(!showClientPicker)}
            >
              <Users size={20} color={Colors.text.secondary} />
              <Text style={[
                styles.clientSelectorText, 
                !selectedClient && styles.placeholderText
              ]}>
                {getSelectedClientName()}
              </Text>
              <View style={styles.chevron} />
            </TouchableOpacity>
            {clientError ? <Text style={styles.errorText}>{clientError}</Text> : null}
            
            {showClientPicker && (
              <View style={styles.pickerContainer}>
                {clients.length > 0 ? (
                  clients.map((client: Client) => (
                    <TouchableOpacity
                      key={client.id}
                      style={styles.pickerItem}
                      onPress={() => {
                        setSelectedClient(client.id);
                        setClientError('');
                        setShowClientPicker(false);
                      }}
                    >
                      <Text style={styles.pickerItemText}>{client.name}</Text>
                      {selectedClient === client.id && (
                        <X size={16} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noClientsContainer}>
                    <Text style={styles.noClientsText}>No clients found</Text>
                    <TouchableOpacity 
                      style={styles.addClientButton}
                      onPress={() => {
                        setShowClientPicker(false);
                        router.push('/add-client');
                      }}
                    >
                      <Text style={styles.addClientText}>Add a client</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </Card>
        
        <View style={styles.mealsHeader}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <TouchableOpacity 
            style={styles.addMealButton}
            onPress={addMeal}
          >
            <Plus size={16} color={Colors.primary} />
            <Text style={styles.addMealText}>Add Meal</Text>
          </TouchableOpacity>
        </View>
        
        {meals.map((meal, index) => (
          <Card key={meal.id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealNumber}>Meal {index + 1}</Text>
              <TouchableOpacity
                style={styles.removeMealButton}
                onPress={() => removeMeal(meal.id)}
              >
                <Trash2 size={18} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mealRow}>
              <View style={styles.mealNameContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <Input
                  placeholder="e.g. Breakfast"
                  value={meal.name}
                  onChangeText={(text) => updateMeal(meal.id, 'name', text)}
                  containerStyle={styles.mealNameInput}
                />
              </View>
              
              <View style={styles.mealTimeContainer}>
                <Text style={styles.inputLabel}>Time</Text>
                <Input
                  placeholder="e.g. 8:00 AM"
                  value={meal.time}
                  onChangeText={(text) => updateMeal(meal.id, 'time', text)}
                  containerStyle={styles.mealTimeInput}
                  leftIcon={<Clock size={16} color={Colors.text.secondary} />}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.mealDescription}
                placeholder="Describe the meal and ingredients"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={meal.description}
                onChangeText={(text) => updateMeal(meal.id, 'description', text)}
              />
            </View>
            
            <Text style={styles.nutritionTitle}>Nutrition (Optional)</Text>
            <View style={styles.nutritionRow}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Input
                  placeholder="kcal"
                  value={meal.calories?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text.trim() ? parseInt(text) : undefined;
                    updateMeal(meal.id, 'calories', value);
                  }}
                  keyboardType="numeric"
                  containerStyle={styles.nutritionInput}
                />
              </View>
              
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Input
                  placeholder="g"
                  value={meal.protein?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text.trim() ? parseInt(text) : undefined;
                    updateMeal(meal.id, 'protein', value);
                  }}
                  keyboardType="numeric"
                  containerStyle={styles.nutritionInput}
                />
              </View>
              
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Input
                  placeholder="g"
                  value={meal.carbs?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text.trim() ? parseInt(text) : undefined;
                    updateMeal(meal.id, 'carbs', value);
                  }}
                  keyboardType="numeric"
                  containerStyle={styles.nutritionInput}
                />
              </View>
              
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Input
                  placeholder="g"
                  value={meal.fat?.toString() || ''}
                  onChangeText={(text) => {
                    const value = text.trim() ? parseInt(text) : undefined;
                    updateMeal(meal.id, 'fat', value);
                  }}
                  keyboardType="numeric"
                  containerStyle={styles.nutritionInput}
                />
              </View>
            </View>
          </Card>
        ))}
        
        <View style={styles.buttonContainer}>
          <Button
            title="Create Meal Plan"
            onPress={handleCreateMealPlan}
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
    padding: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.background.dark,
    borderRadius: 12,
    padding: 12,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    minHeight: 100,
  },
  clientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.dark,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  errorBorder: {
    borderColor: Colors.status.error,
  },
  clientSelectorText: {
    flex: 1,
    marginLeft: 12,
    color: Colors.text.primary,
  },
  placeholderText: {
    color: Colors.text.tertiary,
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.text.secondary,
    transform: [{ rotate: '45deg' }],
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  pickerContainer: {
    backgroundColor: Colors.background.card,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  pickerItemText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  noClientsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noClientsText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  addClientButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addClientText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addMealText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  mealCard: {
    padding: 16,
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  removeMealButton: {
    padding: 4,
  },
  mealRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  mealNameContainer: {
    flex: 2,
  },
  mealTimeContainer: {
    flex: 1,
  },
  mealNameInput: {
    marginBottom: 0,
  },
  mealTimeInput: {
    marginBottom: 0,
  },
  mealDescription: {
    backgroundColor: Colors.background.dark,
    borderRadius: 12,
    padding: 12,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    minHeight: 80,
  },
  nutritionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  nutritionItem: {
    width: '25%',
    paddingHorizontal: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  nutritionInput: {
    marginBottom: 0,
  },
  buttonContainer: {
    marginTop: 32,
  },
});