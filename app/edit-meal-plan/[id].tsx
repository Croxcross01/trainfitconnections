import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { 
  Clock, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Save
} from 'lucide-react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useTrainerStore } from '@/store/trainer-store';
import { MealPlan, Meal } from '@/types';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { formatTo12Hour, formatTo24Hour, formatTimeInput } from '@/utils/time-format';

export default function EditMealPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const trainerStore = useTrainerStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  
  // Fetch the meal plan data
  useEffect(() => {
    if (!id) return;
    
    const mealPlan = trainerStore.mealPlans.find(plan => plan.id === id);
    
    if (mealPlan) {
      setTitle(mealPlan.title);
      setDescription(mealPlan.description);
      
      // Convert meal times to 12-hour format for display
      const formattedMeals = mealPlan.meals.map(meal => ({
        ...meal,
        time: formatTo12Hour(meal.time)
      }));
      
      setMeals([...formattedMeals]);
    } else {
      Alert.alert(
        "Error",
        "Meal plan not found",
        [
          { text: "OK", onPress: () => router.back() }
        ]
      );
    }
    
    setIsLoading(false);
  }, [id]);
  
  // Toggle meal expansion
  const toggleMealExpansion = (mealId: string) => {
    setExpandedMealId(expandedMealId === mealId ? null : mealId);
  };
  
  // Add a new meal
  const addMeal = () => {
    const newMeal: Meal = {
      id: `meal_${Date.now()}`,
      name: 'New Meal',
      time: '12:00 PM',
      description: 'Describe the meal here',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    
    setMeals([...meals, newMeal]);
    setExpandedMealId(newMeal.id);
  };
  
  // Delete a meal
  const deleteMeal = (mealId: string) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setMeals(meals.filter(meal => meal.id !== mealId));
            if (expandedMealId === mealId) {
              setExpandedMealId(null);
            }
          }
        }
      ]
    );
  };
  
  // Update meal property
  const updateMeal = (mealId: string, field: keyof Meal, value: any) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
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
  
  // Save the meal plan
  const saveMealPlan = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for the meal plan");
      return;
    }
    
    if (meals.length === 0) {
      Alert.alert("Error", "Please add at least one meal to the plan");
      return;
    }
    
    setIsSaving(true);
    
    // Get the original meal plan to preserve clientId and trainerId
    const originalPlan = trainerStore.mealPlans.find(plan => plan.id === id);
    
    if (!originalPlan) {
      Alert.alert("Error", "Meal plan not found");
      setIsSaving(false);
      return;
    }
    
    // Convert all meal times to 24-hour format for storage
    const processedMeals = meals.map(meal => ({
      ...meal,
      time: formatTo24Hour(meal.time)
    }));
    
    const updatedPlan: Partial<MealPlan> = {
      title,
      description,
      meals: processedMeals,
    };
    
    trainerStore.updateMealPlan(id, updatedPlan);
    
    setIsSaving(false);
    Alert.alert(
      "Success",
      "Meal plan updated successfully",
      [
        { text: "OK", onPress: () => router.push(`/meal/${id}`) }
      ]
    );
  };
  
  if (isLoading) {
    return (
      <View style={[layout.screen, styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Edit Meal Plan',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveMealPlan}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Save size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView 
        style={[layout.screen, styles.container]} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Title"
            placeholder="Enter meal plan title"
            value={title}
            onChangeText={setTitle}
            containerStyle={{ marginBottom: 16 }}
          />
          
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the meal plan"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Card>
        
        <View style={styles.mealsHeader}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addMeal}
          >
            <Plus size={20} color={Colors.text.inverse} />
            <Text style={styles.addButtonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>
        
        {meals.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No meals added yet</Text>
            <Text style={styles.emptySubtext}>Tap the "Add Meal" button to create your first meal</Text>
          </Card>
        ) : (
          meals.map((meal) => (
            <Card key={meal.id} style={styles.mealCard}>
              <TouchableOpacity 
                style={styles.mealHeader}
                onPress={() => toggleMealExpansion(meal.id)}
              >
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <View style={styles.mealTimeContainer}>
                    <Clock size={14} color={Colors.text.secondary} />
                    <Text style={styles.mealTime}>{meal.time}</Text>
                  </View>
                </View>
                
                <View style={styles.mealActions}>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteMeal(meal.id)}
                  >
                    <Trash2 size={18} color={Colors.status.error} />
                  </TouchableOpacity>
                  
                  {expandedMealId === meal.id ? (
                    <ChevronUp size={20} color={Colors.text.secondary} />
                  ) : (
                    <ChevronDown size={20} color={Colors.text.secondary} />
                  )}
                </View>
              </TouchableOpacity>
              
              {expandedMealId === meal.id && (
                <View style={styles.mealDetails}>
                  <Input
                    label="Meal Name"
                    placeholder="Enter meal name"
                    value={meal.name}
                    onChangeText={(text) => updateMeal(meal.id, 'name', text)}
                    containerStyle={{ marginBottom: 16 }}
                  />
                  
                  <Input
                    label="Time"
                    placeholder="Enter meal time (e.g., 8:00 AM)"
                    value={meal.time}
                    onChangeText={(text) => updateMeal(meal.id, 'time', text)}
                    containerStyle={{ marginBottom: 16 }}
                  />
                  
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe the meal"
                    value={meal.description}
                    onChangeText={(text) => updateMeal(meal.id, 'description', text)}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  
                  <Text style={[styles.inputLabel, { marginTop: 16 }]}>Nutrition Information</Text>
                  
                  <View style={styles.nutritionRow}>
                    <View style={styles.nutritionField}>
                      <Text style={styles.nutritionLabel}>Calories</Text>
                      <TextInput
                        style={styles.nutritionInput}
                        placeholder="0"
                        value={meal.calories?.toString() || ''}
                        onChangeText={(text) => {
                          const value = text ? parseInt(text) : 0;
                          updateMeal(meal.id, 'calories', value);
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.nutritionField}>
                      <Text style={styles.nutritionLabel}>Protein (g)</Text>
                      <TextInput
                        style={styles.nutritionInput}
                        placeholder="0"
                        value={meal.protein?.toString() || ''}
                        onChangeText={(text) => {
                          const value = text ? parseInt(text) : 0;
                          updateMeal(meal.id, 'protein', value);
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.nutritionRow}>
                    <View style={styles.nutritionField}>
                      <Text style={styles.nutritionLabel}>Carbs (g)</Text>
                      <TextInput
                        style={styles.nutritionInput}
                        placeholder="0"
                        value={meal.carbs?.toString() || ''}
                        onChangeText={(text) => {
                          const value = text ? parseInt(text) : 0;
                          updateMeal(meal.id, 'carbs', value);
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.nutritionField}>
                      <Text style={styles.nutritionLabel}>Fat (g)</Text>
                      <TextInput
                        style={styles.nutritionInput}
                        placeholder="0"
                        value={meal.fat?.toString() || ''}
                        onChangeText={(text) => {
                          const value = text ? parseInt(text) : 0;
                          updateMeal(meal.id, 'fat', value);
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  
                  <Input
                    label="Image URL (optional)"
                    placeholder="Enter image URL"
                    value={meal.imageUrl || ''}
                    onChangeText={(text) => updateMeal(meal.id, 'imageUrl', text)}
                    containerStyle={{ marginTop: 16 }}
                  />
                </View>
              )}
            </Card>
          ))
        )}
        
        <Button
          title="Save Meal Plan"
          onPress={saveMealPlan}
          icon={<Save size={20} color={Colors.text.inverse} />}
          iconPosition="left"
          isLoading={isSaving}
          style={styles.saveFullButton}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.background.dark,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    minHeight: 100,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: Colors.text.inverse,
    fontWeight: '500',
    fontSize: 14,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  mealCard: {
    marginBottom: 16,
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  mealTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTime: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  mealDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  nutritionField: {
    flex: 1,
  },
  nutritionLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  nutritionInput: {
    backgroundColor: Colors.background.dark,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  saveButton: {
    padding: 8,
  },
  saveFullButton: {
    marginTop: 16,
  },
});