import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { useAuthStore } from '@/store/auth-store';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, clearError } = useAuthStore();
  
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
  
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000' }}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>TrainFit</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to TrainFit</Text>
        <Text style={styles.subtitle}>
          Connect with fitness professionals and achieve your health goals
        </Text>
        
        <View style={styles.featureContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(5, 150, 105, 0.2)' }]}>
              <Text style={styles.featureIconText}>🏋️</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Personalized Training</Text>
              <Text style={styles.featureDescription}>
                Get customized workout plans tailored to your goals
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={styles.featureIconText}>📱</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Easy Scheduling</Text>
              <Text style={styles.featureDescription}>
                Book and manage sessions with your trainer
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Text style={styles.featureIconText}>🥗</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Nutrition Guidance</Text>
              <Text style={styles.featureDescription}>
                Receive meal plans to complement your workouts
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Create Account"
          onPress={() => router.push('/register')}
          variant="primary"
          fullWidth
          style={styles.button}
        />
        
        <Button
          title="Sign In"
          onPress={() => router.push('/login')}
          variant="primary"
          fullWidth
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 48,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  logoText: {
    ...typography.h1,
    color: Colors.text.primary,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  featureContainer: {
    marginBottom: 48,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    ...typography.body,
    color: Colors.text.secondary,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  button: {
    marginBottom: 16,
  },
});