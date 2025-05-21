import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Utensils, Clock, Dumbbell, User } from 'lucide-react-native';
import { WorkoutPlan, MealPlan } from '@/types';
import Colors from '@/constants/colors';

interface PlanCardProps {
  plan: WorkoutPlan | MealPlan;
  type: 'workout' | 'meal';
  onPress: (plan: WorkoutPlan | MealPlan) => void;
  clientName?: string;
}

export function PlanCard({ plan, type, onPress, clientName }: PlanCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(plan)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {type === 'workout' ? (
          <Dumbbell size={24} color={Colors.primary} />
        ) : (
          <Utensils size={24} color={Colors.primary} />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{plan.description}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.text.secondary} />
            <Text style={styles.metaText}>
              Created {formatDate(plan.createdAt)}
            </Text>
          </View>
          
          {clientName && (
            <View style={styles.clientContainer}>
              <User size={12} color={Colors.text.secondary} />
              <Text style={styles.clientText}>{clientName}</Text>
            </View>
          )}
          
          {type === 'workout' && 'exercises' in plan && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{plan.exercises.length} exercises</Text>
            </View>
          )}
          
          {type === 'meal' && 'meals' in plan && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{plan.meals.length} meals</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  clientText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  badge: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
});