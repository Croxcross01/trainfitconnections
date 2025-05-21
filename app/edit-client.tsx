import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
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

export default function EditClientScreen() {
  const router = useRouter();
  const { clientId } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { clients, updateClient } = useTrainerStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
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
  
  // Redirect non-trainers away from this page
  useEffect(() => {
    if (user?.role !== 'trainer') {
      router.replace('/');
      return;
    }
    
    // Find client by ID
    // First check the store
    let foundClient = clients.find(c => c.id === clientId);
    
    // If not found in store, check mock data
    if (!foundClient) {
      const mockClients: Client[] = [
        {
          id: 'c1',
          name: 'Emma Wilson',
          email: 'emma@example.com',
          role: 'client',
          profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000',
          goals: ['Weight Loss', 'Toning'],
          fitnessLevel: 'intermediate',
          location: {
            latitude: 30.2672,
            longitude: -97.7431,
            address: 'Austin, TX'
          },
          healthInfo: {
            height: 165,
            weight: 62,
            medicalConditions: ['None']
          },
          bio: 'Emma is a marketing professional looking to improve her fitness and lose weight. She enjoys outdoor activities and has been consistent with her training schedule.'
        },
        {
          id: 'c2',
          name: 'Michael Brown',
          email: 'michael@example.com',
          role: 'client',
          profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000',
          goals: ['Muscle Gain', 'Strength'],
          fitnessLevel: 'advanced',
          location: {
            latitude: 30.2982,
            longitude: -97.7431,
            address: 'Austin, TX'
          },
          healthInfo: {
            height: 180,
            weight: 75,
            medicalConditions: ['None']
          },
          bio: 'Michael is a software engineer who has been training for several years. He is focused on building strength and muscle mass, and is dedicated to his nutrition plan.'
        },
        {
          id: 'c3',
          name: 'Sophia Chen',
          email: 'sophia@example.com',
          role: 'client',
          profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000',
          goals: ['Flexibility', 'Posture'],
          fitnessLevel: 'beginner',
          location: {
            latitude: 30.2512,
            longitude: -97.7531,
            address: 'Austin, TX'
          },
          healthInfo: {
            height: 160,
            weight: 55,
            medicalConditions: ['Mild back pain']
          },
          bio: 'Sophia is new to fitness training and is primarily focused on improving her posture and flexibility. She works as a graphic designer and spends long hours at her desk.'
        },
      ];
      
      foundClient = mockClients.find(c => c.id === clientId);
    }
    
    if (foundClient) {
      // Populate form with client data
      setName(foundClient.name);
      setEmail(foundClient.email);
      setProfileImage(foundClient.profileImage || '');
      setBio(foundClient.bio || '');
      setSelectedGoals(foundClient.goals || []);
      setFitnessLevel(foundClient.fitnessLevel || 'beginner');
      
      if (foundClient.location) {
        setLocation(foundClient.location.address);
      }
      
      if (foundClient.healthInfo) {
        setHeight(foundClient.healthInfo.height ? foundClient.healthInfo.height.toString() : '');
        setWeight(foundClient.healthInfo.weight ? foundClient.healthInfo.weight.toString() : '');
        setMedicalConditions(foundClient.healthInfo.medicalConditions ? 
          foundClient.healthInfo.medicalConditions.join(', ') : '');
      }
    } else {
      Alert.alert('Error', 'Client not found');
      router.back();
    }
  }, [clientId, user, router, clients]);
  
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
  
  const handleUpdateClient = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Create updated client object
    const updatedClient: Client = {
      id: clientId as string,
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
        // Update client in store
        updateClient(updatedClient);
        
        setIsLoading(false);
        Alert.alert(
          'Success',
          'Client updated successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } catch (error) {
        console.error('Error updating client:', error);
        setIsLoading(false);
        Alert.alert(
          'Error',
          'Failed to update client. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }, 1000);
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Edit Client",
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
                style={styles.inputWithIconStyle}
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
                style={styles.inputWithIconStyle}
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
                style={styles.inputWithIconStyle}
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
            title="Update Client"
            onPress={handleUpdateClient}
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
  inputWithIconStyle: {
    flex: 1,
    paddingLeft: 45,
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