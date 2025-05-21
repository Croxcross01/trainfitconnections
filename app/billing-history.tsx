import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Card } from '@/components/Card';
import { ChevronRight, Download, Receipt, CreditCard, Calendar, Filter } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useClientStore } from '@/store/client-store';
import { useTrainerStore } from '@/store/trainer-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

// Mock billing history data
const mockBillingHistory = [
  {
    id: '1',
    date: 'May 15, 2023',
    amount: 29.99,
    status: 'Paid',
    description: 'Trainer Pro Subscription',
    type: 'subscription',
    paymentMethod: 'Visa •••• 4242',
    invoiceUrl: 'https://example.com/invoice/123',
  },
  {
    id: '2',
    date: 'May 10, 2023',
    amount: 75.00,
    status: 'Paid',
    description: '1-on-1 Training Session with Alex Johnson',
    type: 'session',
    sessionId: 's1',
    paymentMethod: 'Visa •••• 4242',
    invoiceUrl: 'https://example.com/invoice/122',
  },
  {
    id: '3',
    date: 'April 15, 2023',
    amount: 29.99,
    status: 'Paid',
    description: 'Trainer Pro Subscription',
    type: 'subscription',
    paymentMethod: 'Visa •••• 4242',
    invoiceUrl: 'https://example.com/invoice/121',
  },
  {
    id: '4',
    date: 'April 5, 2023',
    amount: 65.00,
    status: 'Paid',
    description: 'Virtual Training Session with Maria Rodriguez',
    type: 'session',
    sessionId: 's2',
    paymentMethod: 'PayPal',
    invoiceUrl: 'https://example.com/invoice/120',
  },
  {
    id: '5',
    date: 'March 15, 2023',
    amount: 29.99,
    status: 'Paid',
    description: 'Trainer Pro Subscription',
    type: 'subscription',
    paymentMethod: 'Visa •••• 4242',
    invoiceUrl: 'https://example.com/invoice/119',
  },
  {
    id: '6',
    date: 'March 8, 2023',
    amount: 90.00,
    status: 'Refunded',
    description: 'House Call Session with James Wilson (Cancelled)',
    type: 'session',
    sessionId: 's3',
    paymentMethod: 'Apple Pay',
    invoiceUrl: 'https://example.com/invoice/118',
  },
];

// Filter options
const filterOptions = [
  { id: 'all', label: 'All Transactions' },
  { id: 'subscription', label: 'Subscriptions' },
  { id: 'session', label: 'Sessions' },
  { id: 'paid', label: 'Paid' },
  { id: 'refunded', label: 'Refunded' },
];

export default function BillingHistoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [billingHistory, setBillingHistory] = useState(mockBillingHistory);
  
  const isTrainer = user?.role === 'trainer';
  
  const handleDownloadInvoice = (invoiceUrl) => {
    // In a real app, this would download the invoice
    console.log(`Download invoice from ${invoiceUrl}`);
  };

  const handleViewInvoiceDetails = (invoiceId) => {
    // In a real app, this would navigate to invoice details
    console.log(`View invoice details for ${invoiceId}`);
  };
  
  const handleViewSession = (sessionId) => {
    if (sessionId) {
      router.push(`/session/${sessionId}`);
    }
  };
  
  const getFilteredTransactions = () => {
    if (activeFilter === 'all') {
      return billingHistory;
    } else if (activeFilter === 'paid' || activeFilter === 'refunded') {
      return billingHistory.filter(transaction => 
        transaction.status.toLowerCase() === activeFilter.toLowerCase()
      );
    } else {
      return billingHistory.filter(transaction => transaction.type === activeFilter);
    }
  };
  
  const filteredTransactions = getFilteredTransactions();
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return Colors.status.success;
      case 'pending':
        return Colors.status.warning;
      case 'failed':
        return Colors.status.error;
      case 'refunded':
        return Colors.text.secondary;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Billing History" }} />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Current Subscription</Text>
          <View style={styles.summaryDetails}>
            <Text style={styles.planName}>{isTrainer ? 'Trainer Pro' : 'Premium'}</Text>
            <Text style={styles.planPrice}>${isTrainer ? '29.99' : '8.99'}<Text style={styles.planInterval}>/month</Text></Text>
          </View>
          <Text style={styles.nextBilling}>Next billing on June 15, 2023</Text>
          
          <TouchableOpacity 
            style={styles.managePlanButton}
            onPress={() => router.push('/subscriptions')}
          >
            <Text style={styles.managePlanText}>Manage Subscription</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>
            <Filter size={16} color={Colors.text.primary} style={styles.filterIcon} />
            Filter Transactions
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
        
        <Text style={styles.sectionTitle}>
          Transactions ({filteredTransactions.length})
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <Card style={styles.emptyStateCard}>
            <Text style={styles.emptyStateText}>No transactions found for the selected filter.</Text>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard} variant="elevated">
              <View style={styles.transactionHeader}>
                <View style={styles.dateContainer}>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: `${getStatusColor(transaction.status)}20` }
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        { color: getStatusColor(transaction.status) }
                      ]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>${transaction.amount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.transactionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description:</Text>
                  <Text style={styles.detailValue}>{transaction.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Method:</Text>
                  <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type:</Text>
                  <Text style={styles.detailValue}>
                    {transaction.type === 'subscription' ? 'Subscription' : 'Session Payment'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.transactionActions}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleDownloadInvoice(transaction.invoiceUrl)}
                >
                  <Download size={16} color={Colors.primary} />
                  <Text style={styles.actionText}>Receipt</Text>
                </TouchableOpacity>
                
                {transaction.type === 'session' && transaction.sessionId && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewSession(transaction.sessionId)}
                  >
                    <Calendar size={16} color={Colors.primary} />
                    <Text style={styles.actionText}>View Session</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          ))
        )}
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            For any billing questions or issues, please contact our support team at support@trainfit.com
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
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  summaryDetails: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  planInterval: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  nextBilling: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  managePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderRadius: 8,
  },
  managePlanText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginRight: 4,
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
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  transactionCard: {
    marginBottom: 16,
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  transactionDetails: {
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  transactionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 6,
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