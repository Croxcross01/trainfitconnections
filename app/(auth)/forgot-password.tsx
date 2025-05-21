import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';

enum ResetStep {
  RequestToken,
  EnterToken,
  ResetPassword
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset, verifyResetToken, resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.RequestToken);
  const [validationError, setValidationError] = useState('');
  
  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, []);
  
  // Clear validation error when inputs change
  useEffect(() => {
    if (validationError) {
      setValidationError('');
    }
  }, [email, token, newPassword, confirmPassword]);
  
  // Clear auth store error when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, token, newPassword, confirmPassword]);
  
  const handleRequestToken = async () => {
    // Validation
    if (!email) {
      setValidationError('Please enter your email address');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }
    
    setValidationError('');
    
    try {
      await requestPasswordReset(email);
      setCurrentStep(ResetStep.EnterToken);
    } catch (err) {
      // Error is handled by the store
      console.log('Request token error:', err);
    }
  };
  
  const handleVerifyToken = async () => {
    // Validation
    if (!token) {
      setValidationError('Please enter the token you received');
      return;
    }
    
    setValidationError('');
    
    try {
      const isValid = await verifyResetToken(email, token);
      
      if (isValid) {
        setCurrentStep(ResetStep.ResetPassword);
      } else {
        setValidationError('Invalid or expired token. Please try again or request a new token.');
      }
    } catch (err) {
      console.log('Verify token error:', err);
      setValidationError('Failed to verify token. Please try again.');
    }
  };
  
  const handleResetPassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }
    
    // Password validation
    if (newPassword.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    
    // Confirm password
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    setValidationError('');
    
    try {
      await resetPassword(email, token, newPassword);
      // Navigate to login screen after successful password reset
      router.replace('/login');
    } catch (err) {
      // Error is handled by the store
      console.log('Reset password error:', err);
    }
  };
  
  const handleResendToken = async () => {
    try {
      await requestPasswordReset(email);
      Alert.alert(
        "Token Resent",
        "A new token has been sent. Please check the alert."
      );
    } catch (err) {
      console.log('Resend token error:', err);
    }
  };
  
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepRow}>
        <View style={[
          styles.stepCircle,
          currentStep >= ResetStep.RequestToken && styles.stepCircleActive
        ]}>
          <Text style={[
            styles.stepNumber,
            currentStep >= ResetStep.RequestToken && styles.stepNumberActive
          ]}>1</Text>
        </View>
        <View style={[
          styles.stepLine,
          currentStep > ResetStep.RequestToken && styles.stepLineActive
        ]} />
        <View style={[
          styles.stepCircle,
          currentStep >= ResetStep.EnterToken && styles.stepCircleActive
        ]}>
          <Text style={[
            styles.stepNumber,
            currentStep >= ResetStep.EnterToken && styles.stepNumberActive
          ]}>2</Text>
        </View>
        <View style={[
          styles.stepLine,
          currentStep > ResetStep.EnterToken && styles.stepLineActive
        ]} />
        <View style={[
          styles.stepCircle,
          currentStep >= ResetStep.ResetPassword && styles.stepCircleActive
        ]}>
          <Text style={[
            styles.stepNumber,
            currentStep >= ResetStep.ResetPassword && styles.stepNumberActive
          ]}>3</Text>
        </View>
      </View>
      <View style={styles.stepLabelRow}>
        <Text style={[
          styles.stepLabel,
          currentStep >= ResetStep.RequestToken && styles.stepLabelActive
        ]}>Request</Text>
        <Text style={[
          styles.stepLabel,
          currentStep >= ResetStep.EnterToken && styles.stepLabelActive
        ]}>Verify</Text>
        <Text style={[
          styles.stepLabel,
          currentStep >= ResetStep.ResetPassword && styles.stepLabelActive
        ]}>Reset</Text>
      </View>
    </View>
  );
  
  const renderRequestTokenStep = () => (
    <>
      <Text style={styles.subtitle}>Enter your email address to receive a password reset token</Text>
      
      <Input
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        leftIcon={<Mail size={20} color={Colors.text.secondary} />}
      />
      
      <Button
        title="Request Reset Token"
        onPress={handleRequestToken}
        isLoading={isLoading}
        style={styles.button}
        fullWidth
      />
    </>
  );
  
  const renderEnterTokenStep = () => (
    <>
      <Text style={styles.subtitle}>Enter the token you received</Text>
      
      <Input
        placeholder="6-digit token"
        keyboardType="number-pad"
        value={token}
        onChangeText={setToken}
        maxLength={6}
      />
      
      <Button
        title="Verify Token"
        onPress={handleVerifyToken}
        isLoading={isLoading}
        style={styles.button}
        fullWidth
      />
      
      <TouchableOpacity 
        style={styles.resendButton}
        onPress={handleResendToken}
        disabled={isLoading}
      >
        <Text style={styles.resendButtonText}>Didn't receive a token? Resend</Text>
      </TouchableOpacity>
    </>
  );
  
  const renderResetPasswordStep = () => (
    <>
      <Text style={styles.subtitle}>Create a new password</Text>
      
      <Input
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        leftIcon={<Lock size={20} color={Colors.text.secondary} />}
        showPasswordToggle
      />
      
      <Input
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        leftIcon={<Lock size={20} color={Colors.text.secondary} />}
        showPasswordToggle
      />
      
      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        isLoading={isLoading}
        style={styles.button}
        fullWidth
      />
    </>
  );
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
        </View>
        
        {renderStepIndicator()}
        
        <View style={styles.form}>
          {validationError ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={Colors.status.error} style={styles.errorIcon} />
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          ) : null}
          
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={Colors.status.error} style={styles.errorIcon} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          {currentStep === ResetStep.RequestToken && renderRequestTokenStep()}
          {currentStep === ResetStep.EnterToken && renderEnterTokenStep()}
          {currentStep === ResetStep.ResetPassword && renderResetPasswordStep()}
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    ...typography.h2,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: Colors.text.secondary,
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 14,
    flex: 1,
  },
  button: {
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  stepIndicator: {
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.darker,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNumber: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: Colors.text.inverse,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.background.darker,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  stepLabel: {
    color: Colors.text.tertiary,
    fontSize: 12,
    textAlign: 'center',
    width: 80,
  },
  stepLabelActive: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  resendButton: {
    alignSelf: 'center',
    padding: 8,
  },
  resendButtonText: {
    color: Colors.primary,
    fontSize: 14,
  },
});