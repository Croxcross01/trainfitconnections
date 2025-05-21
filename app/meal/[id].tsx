import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useTrainerStore } from '@/store/trainer-store';
import { useClientStore } from '@/store/client-store';
import { MealPlan, Meal } from '@/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { Edit2, Trash2, Clock, ChevronRight } from 'lucide-react-native';
import { formatTo12Hour } from '@/utils/time-format';

export default function MealPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { mealPlans: trainerMealPlans, deleteMealPlan } = useTrainerStore();
  const { mealPlans: clientMealPlans } = useClientStore();
  
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determine if the current user is the trainer who created this meal plan
  const isCreator = user?.role === 'trainer' && mealPlan?.trainerId === user.id;
  
  useEffect(() => {
    const fetchMealPlan = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if the user is a trainer or client
        if (user?.role === 'trainer') {
          // Find the meal plan in the trainer's meal plans
          const plan = trainerMealPlans.find(plan => plan.id === id);
          if (plan) {
            setMealPlan(plan);
          } else {
            setError('Meal plan not found');
          }
        } else if (user?.role === 'client') {
          // Find the meal plan in the client's meal plans
          const plan = clientMealPlans.find(plan => plan.id === id);
          if (plan) {
            setMealPlan(plan);
          } else {
            setError('Meal plan not found');
          }
        } else {
          setError('User role not recognized');
        }
      } catch (err) {
        console.error('Error fetching meal plan:', err);
        setError('Failed to load meal plan');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMealPlan();
  }, [id, user, trainerMealPlans, clientMealPlans]);
  
  const handleEditMealPlan = () => {
    router.push(`/edit-meal-plan/${id}`);
  };
  
  const handleDeleteMealPlan = () => {
    Alert.alert(
      'Delete Meal Plan',
      'Are you sure you want to delete this meal plan? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMealPlan(id);
            Alert.alert('Success', 'Meal plan deleted successfully');
            router.back();
          },
        },
      ]
    );
  };
  
  // Calculate total nutrition values
  const calculateTotalNutrition = () => {
    if (!mealPlan) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return mealPlan.meals.reduce(
      (totals, meal) => {
        return {
          calories: totals.calories + (meal.calories || 0),
          protein: totals.protein + (meal.protein || 0),
          carbs: totals.carbs + (meal.carbs || 0),
          fat: totals.fat + (meal.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };
  
  const totalNutrition = calculateTotalNutrition();
  
  // Format meal time to 12-hour format
  const formatMealTime = (time: string) => {
    return formatTo12Hour(time);
  };
  
  if (isLoading) {
    return (
      <View style={[layout.screen, layout.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (error || !mealPlan) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text style={styles.errorText}>{error || 'Meal plan not found'}</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Meal Plan',
          headerRight: () => isCreator && (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEditMealPlan} style={styles.headerButton}>
                <Edit2 size={20} color={Colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteMealPlan} style={styles.headerButton}>
                <Trash2 size={20} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{mealPlan.title}</Text>
          <Text style={styles.description}>{mealPlan.description}</Text>
        </View>
        
        <Card style={styles.nutritionCard}>
          <Text style={styles.sectionTitle}>Daily Nutrition Summary</Text>
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{totalNutrition.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{totalNutrition.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{totalNutrition.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{totalNutrition.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </Card>
        
        <Text style={styles.mealsTitle}>Meals</Text>
        
        {mealPlan.meals.map((meal: Meal) => (
          <Card key={meal.id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.mealTimeContainer}>
                  <Clock size={14} color={Colors.text.secondary} style={styles.clockIcon} />
                  <Text style={styles.mealTime}>{formatMealTime(meal.time)}</Text>
                </View>
              </View>
              {meal.calories && (
                <Text style={styles.mealCalories}>{meal.calories} cal</Text>
              )}
            </View>
            
            {meal.description && (
              <Text style={styles.mealDescription}>{meal.description}</Text>
            )}
            
            {(meal.protein || meal.carbs || meal.fat) && (
              <View style={styles.macrosContainer}>
                {meal.protein && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{meal.protein}g</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                )}
                {meal.carbs && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{meal.carbs}g</Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                )}
                {meal.fat && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{meal.fat}g</Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                  </View>
                )}
              </View>
            )}
            
            {meal.ingredients && meal.ingredients.length > 0 && (
              <View style={styles.ingredientsContainer}>
                <Text style={styles.ingredientsTitle}>Ingredients:</Text>
                <Text style={styles.ingredients}>
                  {meal.ingredients.join(', ')}
                </Text>
              </View>
            )}
            
            {meal.instructions && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructions}>{meal.instructions}</Text>
              </View>
            )}
          </Card>
        ))}
        
        {isCreator && (
          <View style={styles.actionButtons}>
            <Button
              title="Edit Meal Plan"
              onPress={handleEditMealPlan}
              variant="primary"
              leftIcon={<Edit2 size={18} color={Colors.text.inverse} />}
              style={styles.actionButton}
              fullWidth
            />
            <Button
              title="Delete Meal Plan"
              onPress={handleDeleteMealPlan}
              variant="danger"
              leftIcon={<Trash2 size={18} color={Colors.text.inverse} />}
              style={styles.actionButton}
              fullWidth
            />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  nutritionCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    ...typography.h4,
    color: Colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
  },
  mealsTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  mealCard: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealName: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  mealTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  clockIcon: {
    marginRight: 4,
  },
  mealTime: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
  },
  mealCalories: {
    ...typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
  mealDescription: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  macrosContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  macroItem: {
    marginRight: 24,
  },
  macroValue: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  macroLabel: {
    ...typography.bodySmall,
    color: Colors.text.tertiary,
  },
  ingredientsContainer: {
    marginBottom: 12,
  },
  ingredientsTitle: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  ingredients: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  instructionsContainer: {
    marginBottom: 4,
  },
  instructionsTitle: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructions: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  actionButtons: {
    marginTop: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    alignSelf: 'center',
  },
});