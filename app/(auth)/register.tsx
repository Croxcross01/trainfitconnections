import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Lock, User, Info } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { UserRole } from '@/types';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, isAuthenticated, clearError, debugUsers } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [validationError, setValidationError] = useState('');
  
  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, []);
  
  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);
  
  // Clear validation error when inputs change
  useEffect(() => {
    if (validationError) {
      setValidationError('');
    }
  }, [name, email, password, confirmPassword, role]);
  
  // Clear auth store error when inputs change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [name, email, password, confirmPassword, role]);
  
  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }
    
    // Password validation
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    
    // Confirm password
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    setValidationError('');
    
    try {
      await register(name, email, password, role);
      // Don't navigate here - let the auth protection in _layout handle it
    } catch (err) {
      // Error is handled by the store
      console.log('Registration error:', err);
    }
  };
  
  const showDebugInfo = () => {
    debugUsers();
  };
  
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
        
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000' }}
            style={styles.logoImage}
          />
        </View>
        
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>
        
        <View style={styles.form}>
          {validationError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          ) : null}
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            leftIcon={<User size={20} color={Colors.text.secondary} />}
          />
          
          <Input
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Mail size={20} color={Colors.text.secondary} />}
          />
          
          <Input
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            leftIcon={<Lock size={20} color={Colors.text.secondary} />}
            showPasswordToggle
          />
          
          <Input
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            leftIcon={<Lock size={20} color={Colors.text.secondary} />}
            showPasswordToggle
          />
          
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I want to register as a:</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'client' && styles.roleButtonActive
                ]}
                onPress={() => setRole('client')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'client' && styles.roleButtonTextActive
                  ]}
                >
                  Client
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'trainer' && styles.roleButtonActive
                ]}
                onPress={() => setRole('trainer')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'trainer' && styles.roleButtonTextActive
                  ]}
                >
                  Trainer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.button}
            fullWidth
          />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
          
          {/* Debug button */}
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={showDebugInfo}
          >
            <Info size={16} color={Colors.text.tertiary} />
            <Text style={styles.debugButtonText}>Debug User Info</Text>
          </TouchableOpacity>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
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
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 14,
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: Colors.background.darker,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
  },
  roleButtonText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  roleButtonTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  button: {
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
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
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.darker,
    alignSelf: 'center',
  },
  debugButtonText: {
    color: Colors.text.tertiary,
    fontSize: 12,
    marginLeft: 4,
  },
});