import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { X, Check, User, Mail, MapPin, Activity, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/auth-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { Client } from '@/types';

const fitnessGoals = [
  'Weight Loss',
  'Muscle Gain',
  'Strength',
  'Endurance',
  'Flexibility',
  'Toning',
  'Posture',
  'Rehabilitation',
  'Sports Performance',
];

const fitnessLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function AddClientScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addClient } = useTrainerStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  
  // Validation states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const pickImage = async () => {
    try {
      setImageUploading(true);
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // In a real app, you would upload this to a server and get back a URL
        // For this demo, we'll just use the local URI
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };
  
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    return isValid;
  };
  
  const handleAddClient = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Create new client object
    const newClient: Client = {
      id: `c${Date.now()}`,
      name,
      email,
      role: 'client',
      profileImage,
      bio,
      goals: selectedGoals,
      fitnessLevel,
      location: {
        latitude: 30.2672,
        longitude: -97.7431,
        address: location || 'Austin, TX'
      },
      healthInfo: {
        height: height ? parseInt(height, 10) : undefined,
        weight: weight ? parseInt(weight, 10) : undefined,
        medicalConditions: medicalConditions ? medicalConditions.split(',').map(c => c.trim()) : []
      }
    };
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Add client to store
        addClient(newClient);
        
        setIsLoading(false);
        Alert.alert(
          'Success',
          'Client added successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } catch (error) {
        console.error('Error adding client:', error);
        setIsLoading(false);
        Alert.alert(
          'Error',
          'Failed to add client. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }, 1000);
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Add New Client",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <User size={40} color={Colors.text.secondary} />
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.changeImageButton}
            onPress={pickImage}
            disabled={imageUploading}
          >
            <Upload size={16} color={Colors.primary} style={styles.uploadIcon} />
            <Text style={styles.changeImageText}>
              {imageUploading ? "Uploading..." : "Change Image"}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Card style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color={Colors.text.secondary} style={styles.inputIcon} />
              <Input
                placeholder="Enter client's full name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text.trim()) setNameError('');
                }}
                error={nameError}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWithIcon}>
              <Mail size={20} color={Colors.text.secondary} style={styles.inputIcon} />
              <Input
                placeholder="Enter client's email address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validateEmail(text) || !text.trim()) setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={Colors.text.secondary} style={styles.inputIcon} />
              <Input
                placeholder="Enter client's location"
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <Input
              placeholder="Enter client's bio"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </View>
        </Card>
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Fitness Profile</Text>
        
        <Card style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fitness Goals (Select all that apply)</Text>
            <View style={styles.goalsContainer}>
              {fitnessGoals.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalChip,
                    selectedGoals.includes(goal) && styles.selectedGoalChip
                  ]}
                  onPress={() => toggleGoal(goal)}
                >
                  <Text
                    style={[
                      styles.goalChipText,
                      selectedGoals.includes(goal) && styles.selectedGoalChipText
                    ]}
                  >
                    {goal}
                  </Text>
                  {selectedGoals.includes(goal) && (
                    <Check size={14} color={Colors.text.inverse} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fitness Level</Text>
            <View style={styles.fitnessLevelContainer}>
              {fitnessLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.levelButton,
                    fitnessLevel === level.value && styles.selectedLevelButton,
                    level.value === 'beginner' && styles.beginnerButton,
                    level.value === 'intermediate' && styles.intermediateButton,
                    level.value === 'advanced' && styles.advancedButton,
                  ]}
                  onPress={() => setFitnessLevel(level.value as 'beginner' | 'intermediate' | 'advanced')}
                >
                  <Activity size={16} color={fitnessLevel === level.value ? Colors.text.inverse : Colors.text.secondary} />
                  <Text
                    style={[
                      styles.levelButtonText,
                      fitnessLevel === level.value && styles.selectedLevelButtonText
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Health Information</Text>
        
        <Card style={styles.card}>
          <View style={styles.healthInfoRow}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <Input
                placeholder="Height"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <Input
                placeholder="Weight"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Medical Conditions (comma separated)</Text>
            <Input
              placeholder="E.g. Asthma, Back pain, None"
              value={medicalConditions}
              onChangeText={setMedicalConditions}
              multiline
              numberOfLines={2}
              style={styles.textArea}
            />
          </View>
        </Card>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Add Client"
            onPress={handleAddClient}
            isLoading={isLoading}
            fullWidth
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerButton: {
    padding: 8,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  uploadIcon: {
    marginRight: 6,
  },
  changeImageText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  inputWithIcon: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.dark,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  selectedGoalChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goalChipText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  selectedGoalChipText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 4,
  },
  fitnessLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: Colors.background.dark,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  selectedLevelButton: {
    borderColor: 'transparent',
  },
  beginnerButton: {
    backgroundColor: Colors.secondary,
  },
  intermediateButton: {
    backgroundColor: Colors.primary,
  },
  advancedButton: {
    backgroundColor: Colors.status.info,
  },
  levelButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  selectedLevelButtonText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
  healthInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  buttonContainer: {
    marginTop: 32,
  },
});