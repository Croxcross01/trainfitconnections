import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/auth-store';
import { useTrainerStore } from '@/store/trainer-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react-native';

// Filter options
const filterOptions = [
  { id: 'all', label: 'All Time' },
  { id: 'month', label: 'This Month' },
  { id: 'week', label: 'This Week' },
  { id: 'day', label: 'Today' },
];

export default function RevenueScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { sessions, payments, revenue, fetchRevenue, isLoading } = useTrainerStore();
  const [activeFilter, setActiveFilter] = useState('month');
  
  // Check if user is a trainer
  if (user?.role !== 'trainer') {
    router.replace('/(tabs)');
    return null;
  }
  
  // Fetch revenue data when component mounts or filter changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchRevenue(activeFilter as 'day' | 'week' | 'month' | 'year' | 'all');
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
      }
    };
    
    fetchData();
  }, [activeFilter, fetchRevenue]);
  
  const navigateToTransaction = (transactionId: string) => {
    // In a real app, this would navigate to transaction details
    console.log(`View transaction details for ${transactionId}`);
  };
  
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <>
      <Stack.Screen options={{ title: "Revenue" }} />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Revenue Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Revenue Summary</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Info size={16} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Earnings</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(revenue.totalEarnings)}</Text>
            
            <View style={styles.balanceDetails}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Available</Text>
                <Text style={styles.balanceItemAmount}>{formatCurrency(revenue.availableBalance)}</Text>
              </View>
              
              <View style={styles.balanceDivider} />
              
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>Pending</Text>
                <Text style={styles.balanceItemAmount}>{formatCurrency(revenue.pendingPayouts)}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.taxNote}>
            Note: A 1.5% processing fee applies to all cash outs
          </Text>
        </Card>
        
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>
            <Filter size={16} color={Colors.text.primary} style={styles.filterIcon} />
            Time Period
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterButton,
                  activeFilter === option.id && styles.activeFilterButton
                ]}
                onPress={() => setActiveFilter(option.id)}
              >
                <Text style={[
                  styles.filterButtonText,
                  activeFilter === option.id && styles.activeFilterButtonText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <DollarSign size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statAmount}>{formatCurrency(revenue.currentMonth.earnings)}</Text>
            <Text style={styles.statLabel}>This Month</Text>
            <View style={styles.growthContainer}>
              <ArrowUpRight size={14} color={Colors.status.success} />
              <Text style={styles.growthText}>{revenue.currentMonth.growth}%</Text>
            </View>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Users size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statAmount}>{revenue.currentMonth.clientCount}</Text>
            <Text style={styles.statLabel}>Active Clients</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statAmount}>{revenue.currentMonth.sessionsCompleted}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </Card>
        </View>
        
        {/* Revenue Breakdown */}
        <Card style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
          
          {revenue.revenueByType.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownItemHeader}>
                <Text style={styles.breakdownItemType}>{item.type}</Text>
                <Text style={styles.breakdownItemAmount}>{formatCurrency(item.amount)}</Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${item.percentage}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.breakdownItemPercentage}>{item.percentage}%</Text>
            </View>
          ))}
        </Card>
        
        {/* Recent Transactions */}
        <Card style={styles.transactionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/billing-history')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : payments.length > 0 ? (
            payments.slice(0, 5).map((payment, index) => (
              <TouchableOpacity 
                key={payment.id}
                style={[
                  styles.transactionItem,
                  index < payments.length - 1 && styles.transactionItemBorder
                ]}
                onPress={() => navigateToTransaction(payment.id)}
              >
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionClient}>
                    {sessions.find(s => s.id === payment.sessionId)?.clientId || 'Client'}
                  </Text>
                  <View style={styles.transactionMeta}>
                    <Text style={styles.transactionDate}>{formatDate(payment.date)}</Text>
                    <Text style={styles.transactionDot}>•</Text>
                    <Text style={styles.transactionType}>
                      {sessions.find(s => s.id === payment.sessionId)?.type || 'Session'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.transactionAmount}>
                  <Text style={styles.transactionAmountText}>
                    +{formatCurrency(payment.amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Transactions will appear here once you start receiving payments
              </Text>
            </View>
          )}
        </Card>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Revenue data is updated in real-time as payments are processed. Cash outs are subject to a 1.5% processing fee and typically arrive in your bank account within 1-3 business days.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    ...typography.h5,
    color: Colors.text.primary,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.darker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  balanceAmount: {
    ...typography.h2,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  balanceItemAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.light,
  },
  taxNote: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: 8,
  },
  filterContainer: {
    paddingBottom: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  activeFilterButton: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  activeFilterButtonText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthText: {
    fontSize: 12,
    color: Colors.status.success,
    marginLeft: 2,
  },
  breakdownCard: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownItemType: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  breakdownItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.background.darker,
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  breakdownItemPercentage: {
    fontSize: 12,
    color: Colors.text.secondary,
    alignSelf: 'flex-end',
  },
  transactionsCard: {
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionClient: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  transactionDot: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginHorizontal: 4,
  },
  transactionType: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  transactionAmount: {
    justifyContent: 'center',
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.status.success,
  },
  emptyStateContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
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