import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, ChevronRight, CreditCard, Star } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

// Mock subscription plans
const subscriptionPlans = {
  client: [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      interval: 'month',
      features: [
        'Access to basic workout plans',
        'Limited trainer messaging',
        'Basic nutrition tracking',
      ],
      color: Colors.primary,
      isFree: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 8.99,
      interval: 'month',
      features: [
        'Access to all workout plans',
        'Unlimited trainer messaging',
        'Advanced nutrition tracking',
        'Weekly progress reports',
        'Priority support',
      ],
      color: Colors.secondary,
      popular: true,
    },
  ],
  trainer: [
    {
      id: 'trainer_basic',
      name: 'Trainer Basic',
      price: 0,
      interval: 'month',
      features: [
        'Basic client management',
        'Simple workout templates',
        'Limited client capacity (5)',
        'Standard listing in search',
        'Basic analytics',
      ],
      color: Colors.primary,
      isFree: true,
    },
    {
      id: 'trainer',
      name: 'Trainer Pro',
      price: 29.99,
      interval: 'month',
      features: [
        'Client management tools',
        'Custom workout builder',
        'Meal plan creator',
        'Analytics dashboard',
        'Promotional tools',
        'Priority listing in search',
        'Unlimited client capacity',
      ],
      color: '#F59E0B', // Amber color
    },
  ]
};

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activePlan, setActivePlan] = useState('basic'); // Mock active plan
  
  const isTrainer = user?.role === 'trainer';
  
  const handleSubscribe = (planId) => {
    // In a real app, this would navigate to a payment screen or process
    console.log(`Subscribe to ${planId} plan`);
    // For demo purposes, just set as active
    setActivePlan(planId);
  };
  
  const handleManagePayment = () => {
    // In a real app, this would navigate to payment management
    console.log('Navigate to payment management');
  };
  
  const handleViewBillingHistory = () => {
    // Navigate to billing history page
    router.push('/billing-history');
  };
  
  return (
    <ScrollView style={[layout.screen, styles.container]} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Your Subscription</Text>
      
      {/* Current Plan Card */}
      <Card style={styles.currentPlanCard} variant="elevated">
        <View style={styles.currentPlanHeader}>
          <Text style={styles.currentPlanTitle}>Current Plan</Text>
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
            <Text style={[styles.statusText, { color: Colors.primary }]}>Active</Text>
          </View>
        </View>
        
        <View style={styles.planDetails}>
          <Text style={styles.planName}>
            {activePlan === 'basic' ? 'Basic' : 
             activePlan === 'premium' ? 'Premium' : 
             activePlan === 'trainer_basic' ? 'Trainer Basic' : 'Trainer Pro'}
          </Text>
          <Text style={styles.planPrice}>
            {activePlan === 'basic' || activePlan === 'trainer_basic' ? 'Free' : 
             activePlan === 'premium' ? '$8.99' : '$29.99'}/
            <Text style={styles.planInterval}>month</Text>
          </Text>
        </View>
        
        {activePlan !== 'basic' && activePlan !== 'trainer_basic' && (
          <>
            <View style={styles.billingInfo}>
              <Text style={styles.nextBillingLabel}>Next billing date:</Text>
              <Text style={styles.nextBillingDate}>June 15, 2023</Text>
            </View>
            
            <View style={styles.paymentMethodContainer}>
              <View style={styles.paymentMethod}>
                <CreditCard size={20} color={Colors.text.secondary} style={styles.paymentIcon} />
                <Text style={styles.paymentText}>•••• 4242</Text>
              </View>
              <TouchableOpacity onPress={handleManagePayment}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.billingHistoryButton} onPress={handleViewBillingHistory}>
              <Text style={styles.billingHistoryText}>View Billing History</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </Card>
      
      {/* Client Plans Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Client Plans</Text>
        <Text style={styles.sectionDescription}>
          Choose a plan that fits your fitness journey as a client
        </Text>
        
        {subscriptionPlans.client.map((plan) => (
          <Card 
            key={plan.id} 
            style={[
              styles.planCard, 
              plan.popular && styles.popularPlanCard,
              plan.id === activePlan && styles.activePlanCard
            ]} 
            variant="elevated"
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Star size={12} color="#FFF" />
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}
            
            <View style={styles.planCardHeader}>
              <Text style={styles.planCardName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                {plan.isFree ? (
                  <Text style={styles.planCardPrice}>Free</Text>
                ) : (
                  <>
                    <Text style={styles.planCardPrice}>${plan.price}</Text>
                    <Text style={styles.planCardInterval}>/{plan.interval}</Text>
                  </>
                )}
              </View>
            </View>
            
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.checkIconContainer, { backgroundColor: `${plan.color}20` }]}>
                    <Check size={14} color={plan.color} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[
                styles.subscribeButton, 
                { backgroundColor: plan.id === activePlan ? Colors.text.tertiary : plan.color }
              ]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={plan.id === activePlan}
            >
              <Text style={styles.subscribeButtonText}>
                {plan.id === activePlan ? 'Current Plan' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
      
      {/* Trainer Plans Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Trainer Plans</Text>
        <Text style={styles.sectionDescription}>
          Unlock professional tools to grow your training business
        </Text>
        
        {subscriptionPlans.trainer.map((plan) => (
          <Card 
            key={plan.id} 
            style={[
              styles.planCard, 
              plan.id === activePlan && styles.activePlanCard
            ]} 
            variant="elevated"
          >
            <View style={styles.planCardHeader}>
              <Text style={styles.planCardName}>{plan.name}</Text>
              <View style={styles.priceContainer}>
                {plan.isFree ? (
                  <Text style={styles.planCardPrice}>Free</Text>
                ) : (
                  <>
                    <Text style={styles.planCardPrice}>${plan.price}</Text>
                    <Text style={styles.planCardInterval}>/{plan.interval}</Text>
                  </>
                )}
              </View>
            </View>
            
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={[styles.checkIconContainer, { backgroundColor: `${plan.color}20` }]}>
                    <Check size={14} color={plan.color} />
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[
                styles.subscribeButton, 
                { backgroundColor: plan.id === activePlan ? Colors.text.tertiary : plan.color }
              ]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={plan.id === activePlan}
            >
              <Text style={styles.subscribeButtonText}>
                {plan.id === activePlan ? 'Current Plan' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          </Card>
        ))}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          You can cancel your subscription at any time from your account settings.
          For any questions about billing, please contact our support team.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 24,
  },
  currentPlanCard: {
    marginBottom: 32,
    padding: 16,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  planDetails: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  planInterval: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  billingInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nextBillingLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  nextBillingDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    marginRight: 8,
  },
  paymentText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  changeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  billingHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billingHistoryText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  planCard: {
    marginBottom: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  popularPlanCard: {
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  activePlanCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  planCardHeader: {
    marginBottom: 16,
  },
  planCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planCardPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  planCardInterval: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flex: 1,
  },
  subscribeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 8,
    marginBottom: 32,
    padding: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});