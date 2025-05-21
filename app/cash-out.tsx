import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useTrainerStore } from '@/store/trainer-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { 
  DollarSign, 
  CreditCard, 
  Building, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Info,
  ArrowRight,
  Wallet
} from 'lucide-react-native';

// Mock payment methods
const mockPaymentMethods = [
  {
    id: 'pm1',
    type: 'bank',
    name: 'Chase Bank',
    last4: '4567',
    isDefault: true,
  },
  {
    id: 'pm2',
    type: 'card',
    name: 'Visa',
    last4: '8901',
    isDefault: false,
  }
];

// Mock payout history
const mockPayoutHistory = [
  {
    id: 'po1',
    date: '2023-05-01',
    amount: 750.00,
    method: 'Chase Bank ••••4567',
    status: 'completed',
    arrivalDate: '2023-05-03',
  },
  {
    id: 'po2',
    date: '2023-04-15',
    amount: 500.00,
    method: 'Chase Bank ••••4567',
    status: 'completed',
    arrivalDate: '2023-04-17',
  },
  {
    id: 'po3',
    date: '2023-04-01',
    amount: 625.50,
    method: 'Visa ••••8901',
    status: 'completed',
    arrivalDate: '2023-04-03',
  },
];

export default function CashOutScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [processingCashOut, setProcessingCashOut] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(mockPaymentMethods[0].id);
  const [cashOutAmount, setCashOutAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [payoutHistory, setPayoutHistory] = useState(mockPayoutHistory);
  
  // Available balance (would come from API in a real app)
  const availableBalance = 1875.50;
  
  // Check if user is a trainer
  if (user?.role !== 'trainer') {
    router.replace('/(tabs)');
    return null;
  }
  
  const handleCashOut = () => {
    // Validate amount
    const amount = parseFloat(cashOutAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to cash out.');
      return;
    }
    
    if (amount > availableBalance) {
      Alert.alert('Insufficient Funds', 'The amount exceeds your available balance.');
      return;
    }
    
    // Minimum cash out amount
    if (amount < 20) {
      Alert.alert('Minimum Amount', 'The minimum cash out amount is $20.');
      return;
    }
    
    // Calculate fee
    const fee = amount * 0.015; // 1.5% fee
    const netAmount = amount - fee;
    
    // Confirm cash out
    Alert.alert(
      'Confirm Cash Out',
      `Amount: $${amount.toFixed(2)}
Fee (1.5%): $${fee.toFixed(2)}
Net Amount: $${netAmount.toFixed(2)}

Do you want to proceed?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => processCashOut(amount, fee, netAmount),
        },
      ]
    );
  };
  
  const processCashOut = async (amount: number, fee: number, netAmount: number) => {
    setProcessingCashOut(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get selected payment method
      const method = paymentMethods.find(m => m.id === selectedMethod);
      
      if (!method) {
        throw new Error('Payment method not found');
      }
      
      // Create new payout record
      const newPayout = {
        id: `po${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: amount,
        method: `${method.name} ••••${method.last4}`,
        status: 'processing',
        arrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      };
      
      // Update payout history
      setPayoutHistory([newPayout, ...payoutHistory]);
      
      // Show success message
      Alert.alert(
        'Cash Out Initiated',
        `Your cash out of $${amount.toFixed(2)} has been initiated. The funds should arrive in your account within 1-3 business days.`,
        [{ text: 'OK' }]
      );
      
      // Clear cash out amount
      setCashOutAmount('');
    } catch (error) {
      Alert.alert('Error', 'There was an error processing your cash out. Please try again.');
    } finally {
      setProcessingCashOut(false);
    }
  };
  
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return Colors.status.success;
      case 'processing':
        return Colors.status.warning;
      case 'failed':
        return Colors.status.error;
      default:
        return Colors.text.secondary;
    }
  };
  
  const navigateToAddPaymentMethod = () => {
    // In a real app, this would navigate to add payment method screen
    Alert.alert('Add Payment Method', 'This would navigate to a screen to add a new payment method.');
  };
  
  return (
    <>
      <Stack.Screen options={{ title: "Cash Out" }} />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(availableBalance)}</Text>
          
          <View style={styles.cashOutContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="decimal-pad"
                value={cashOutAmount}
                onChangeText={setCashOutAmount}
              />
            </View>
            
            <Button
              title="Cash Out"
              onPress={handleCashOut}
              variant="primary"
              isLoading={processingCashOut}
              disabled={!cashOutAmount || processingCashOut}
              icon={<DollarSign size={16} color={Colors.text.inverse} />}
              style={styles.cashOutButton}
            />
          </View>
          
          <View style={styles.feeContainer}>
            <Text style={styles.feeText}>
              A 1.5% processing fee applies to all cash outs
            </Text>
            <TouchableOpacity style={styles.infoButton}>
              <Info size={14} color={Colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </Card>
        
        {/* Payment Methods */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={navigateToAddPaymentMethod}
            >
              <Text style={styles.addButtonText}>Add New</Text>
              <ChevronRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            paymentMethods.map((method) => (
              <TouchableOpacity 
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  selectedMethod === method.id && styles.selectedPaymentMethod
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={styles.paymentMethodIcon}>
                  {method.type === 'bank' ? (
                    <Building size={20} color={Colors.text.primary} />
                  ) : (
                    <CreditCard size={20} color={Colors.text.primary} />
                  )}
                </View>
                
                <View style={styles.paymentMethodDetails}>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                  <Text style={styles.paymentMethodInfo}>••••{method.last4}</Text>
                </View>
                
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                
                <View style={styles.radioButton}>
                  {selectedMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </Card>
        
        {/* Cash Out Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Clock size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Processing Time</Text>
              <Text style={styles.infoDescription}>
                Cash outs are typically processed within 1-3 business days.
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <DollarSign size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Minimum Amount</Text>
              <Text style={styles.infoDescription}>
                The minimum cash out amount is $20.00.
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Wallet size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Processing Fee</Text>
              <Text style={styles.infoDescription}>
                A 1.5% processing fee is applied to all cash outs.
              </Text>
            </View>
          </View>
        </Card>
        
        {/* Recent Payouts */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payouts</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : payoutHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No payout history yet</Text>
            </View>
          ) : (
            payoutHistory.map((payout, index) => (
              <View 
                key={payout.id}
                style={[
                  styles.payoutItem,
                  index < payoutHistory.length - 1 && styles.payoutItemBorder
                ]}
              >
                <View style={styles.payoutHeader}>
                  <Text style={styles.payoutDate}>{formatDate(payout.date)}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(payout.status)}20` }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(payout.status) }
                    ]}>
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.payoutDetails}>
                  <View style={styles.payoutAmount}>
                    <Text style={styles.payoutAmountText}>{formatCurrency(payout.amount)}</Text>
                    <Text style={styles.payoutMethod}>{payout.method}</Text>
                  </View>
                  
                  {payout.status === 'processing' ? (
                    <View style={styles.estimatedArrival}>
                      <Clock size={14} color={Colors.text.secondary} style={styles.arrivalIcon} />
                      <Text style={styles.arrivalText}>
                        Est. arrival: {formatDate(payout.arrivalDate)}
                      </Text>
                    </View>
                  ) : payout.status === 'completed' ? (
                    <View style={styles.estimatedArrival}>
                      <CheckCircle size={14} color={Colors.status.success} style={styles.arrivalIcon} />
                      <Text style={[styles.arrivalText, { color: Colors.status.success }]}>
                        Arrived: {formatDate(payout.arrivalDate)}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.estimatedArrival}>
                      <AlertCircle size={14} color={Colors.status.error} style={styles.arrivalIcon} />
                      <Text style={[styles.arrivalText, { color: Colors.status.error }]}>
                        Failed
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
          
          {payoutHistory.length > 0 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/billing-history')}
            >
              <Text style={styles.viewAllText}>View All Transactions</Text>
              <ArrowRight size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </Card>
        
        <View style={styles.taxInfoContainer}>
          <Text style={styles.taxInfoText}>
            For tax purposes, you will receive a 1099-K form for all earnings processed through our platform if you earn more than $600 in a calendar year. Please consult with a tax professional regarding your tax obligations.
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
  balanceCard: {
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  balanceAmount: {
    ...typography.h2,
    color: Colors.text.primary,
    marginBottom: 24,
  },
  cashOutContainer: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.background.light,
  },
  dollarSign: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.text.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '500',
    color: Colors.text.primary,
    padding: 12,
  },
  cashOutButton: {
    width: '100%',
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginRight: 4,
  },
  infoButton: {
    padding: 4,
  },
  section: {
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: Colors.background.light,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  selectedPaymentMethod: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  paymentMethodInfo: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderRadius: 12,
    marginRight: 8,
  },
  defaultText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  infoCard: {
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  payoutItem: {
    paddingVertical: 16,
  },
  payoutItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  payoutDate: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  payoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutAmount: {
    flex: 1,
  },
  payoutAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  payoutMethod: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  estimatedArrival: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrivalIcon: {
    marginRight: 4,
  },
  arrivalText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 8,
  },
  taxInfoContainer: {
    marginTop: 8,
    marginBottom: 32,
    padding: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 8,
  },
  taxInfoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});