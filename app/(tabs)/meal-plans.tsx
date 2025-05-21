import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Utensils, Search, Filter, Plus } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Input } from '@/components/Input';
import { PlanCard } from '@/components/PlanCard';
import { MealPlan } from '@/types';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

export default function MealPlansScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const clientStore = useClientStore();
  const trainerStore = useTrainerStore();
  
  const isTrainer = user?.role === "trainer";
  const { isLoading } = isTrainer ? trainerStore : clientStore;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlans, setFilteredPlans] = useState<MealPlan[]>([]);
  
  // Get meal plans from the appropriate store
  const mealPlans = isTrainer ? trainerStore.mealPlans : clientStore.mealPlans;
  
  // Fetch meal plans for clients when the screen loads
  useEffect(() => {
    if (!isTrainer) {
      clientStore.getMealPlans();
    }
  }, [isTrainer]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPlans(mealPlans);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = mealPlans.filter(plan => 
        plan.title.toLowerCase().includes(query) ||
        plan.description.toLowerCase().includes(query)
      );
      setFilteredPlans(filtered);
    }
  }, [searchQuery, mealPlans]);
  
  const handlePlanPress = (plan: MealPlan) => {
    router.push(`/meal/${plan.id}`);
  };

  const handleAddMealPlan = () => {
    router.push('/add-meal-plan');
  };
  
  return (
    <View style={[layout.screen, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Plans</Text>
        {isTrainer && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddMealPlan}
          >
            <Plus size={20} color={Colors.text.inverse} />
          </TouchableOpacity>
        )}
        {!isTrainer && (
          <View style={styles.headerIcon}>
            <Utensils size={24} color={Colors.primary} />
          </View>
        )}
      </View>
      
      <Text style={styles.subtitle}>
        {isTrainer 
          ? "Create and manage nutrition plans for your clients" 
          : "Personalized nutrition plans designed by your trainers"
        }
      </Text>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            placeholder="Search meal plans..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={20} color={Colors.text.secondary} />}
          />
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
              type="meal" 
              onPress={() => handlePlanPress(item)} 
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <Utensils size={40} color={Colors.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>No meal plans found</Text>
          <Text style={styles.emptyStateText}>
            {isTrainer 
              ? "Create meal plans for your clients to help them achieve their nutrition goals."
              : "Try adjusting your search or ask your trainer to create a meal plan for you."
            }
          </Text>
          {isTrainer && (
            <TouchableOpacity
              style={styles.addPlanButton}
              onPress={handleAddMealPlan}
            >
              <Text style={styles.addPlanText}>Create New Meal Plan</Text>
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
    fontSize: 16,
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
    fontSize: 16,
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