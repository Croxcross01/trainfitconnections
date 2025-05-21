import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Switch, Alert, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Upload, X, Plus, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTrainerStore } from '@/store/trainer-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

export default function AddPhotoScreen() {
  const router = useRouter();
  const { addPhoto } = useTrainerStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'results' | 'workout' | 'equipment' | 'facility' | 'other'>('results');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isBeforeAfter, setIsBeforeAfter] = useState(false);
  
  const [imageUrl, setImageUrl] = useState('');
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  
  // Mock image URLs for demo purposes
  const mockImages = [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
    'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?q=80&w=1000',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1000',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000',
  ];
  
  const mockBeforeImages = [
    'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?q=80&w=1000',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000',
  ];
  
  const categories = [
    { id: 'results', name: 'Results' },
    { id: 'workout', name: 'Workouts' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'facility', name: 'Facility' },
    { id: 'other', name: 'Other' },
  ];
  
  const pickImage = async (isBeforeImage = false) => {
    try {
      if (isBeforeImage) {
        setIsUploadingBefore(true);
      } else {
        setIsUploading(true);
      }
      
      // Check for permissions first
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Sorry, we need photo library permissions to upload images!');
          if (isBeforeImage) {
            setIsUploadingBefore(false);
          } else {
            setIsUploading(false);
          }
          return;
        }
      }
      
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduced quality to decrease file size
        // Set a maximum size limit
        exif: false, // Don't include EXIF data to reduce size
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Check file size (limit to 2MB)
        const fileSize = selectedAsset.fileSize || 0;
        const maxSize = 2 * 1024 * 1024; // 2MB
        
        if (fileSize > maxSize) {
          Alert.alert(
            "File Too Large", 
            `The selected image is ${(fileSize / (1024 * 1024)).toFixed(2)}MB. Maximum allowed size is 2MB. Please select a smaller image or compress this one.`
          );
          return;
        }
        
        // In a real app, you would upload this to a server and get back a URL
        // For this demo, we'll use mock URLs instead of local URIs to avoid large payloads
        if (isBeforeImage) {
          // Use a mock URL instead of the local URI to avoid large payloads
          const randomIndex = Math.floor(Math.random() * mockBeforeImages.length);
          setBeforeImageUrl(mockBeforeImages[randomIndex]);
        } else {
          // Use a mock URL instead of the local URI to avoid large payloads
          const randomIndex = Math.floor(Math.random() * mockImages.length);
          setImageUrl(mockImages[randomIndex]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      if (isBeforeImage) {
        setIsUploadingBefore(false);
      } else {
        setIsUploading(false);
      }
    }
  };
  
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSelectImage = () => {
    // Use image picker
    pickImage(false);
  };
  
  const handleSelectBeforeImage = () => {
    // Use image picker
    pickImage(true);
  };
  
  const handleSavePhoto = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your photo");
      return;
    }
    
    if (!imageUrl) {
      Alert.alert("Error", "Please select an image");
      return;
    }
    
    if (isBeforeAfter && !beforeImageUrl) {
      Alert.alert("Error", "Please select a before image");
      return;
    }
    
    // Check if description is too long
    if (description.length > 500) {
      Alert.alert("Error", "Description is too long. Maximum 500 characters allowed.");
      return;
    }
    
    // Check payload size before saving
    const photoData = {
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      category,
      tags,
      trainerId: user?.id || 't1',
      isBeforeAfter,
      beforeImageUrl: isBeforeAfter ? beforeImageUrl : undefined,
      createdAt: new Date().toISOString(), // Add createdAt
      likes: 0 // Add likes with default value
    };
    
    // Estimate payload size
    const payloadSize = new Blob([JSON.stringify(photoData)]).size;
    const maxSize = 1 * 1024 * 1024; // 1MB
    
    if (payloadSize > maxSize) {
      Alert.alert(
        "Data Too Large", 
        "The photo data is too large. Please use shorter descriptions and fewer tags."
      );
      return;
    }
    
    // Remove createdAt and likes before passing to addPhoto
    const { createdAt, likes, ...photoDataToAdd } = photoData;
    
    addPhoto(photoDataToAdd);
    router.back();
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Add New Photo',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSavePhoto}
            >
              <Check size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={layout.screen} contentContainerStyle={styles.container}>
        <Card style={styles.imageSection}>
          {imageUrl ? (
            <View style={styles.selectedImageContainer}>
              <Image 
                source={{ uri: imageUrl }}
                style={styles.selectedImage}
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImageUrl('')}
              >
                <X size={20} color={Colors.text.inverse} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleSelectImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <Text style={styles.uploadingText}>Uploading...</Text>
              ) : (
                <>
                  <Upload size={32} color={Colors.text.secondary} />
                  <Text style={styles.uploadText}>Upload Photo</Text>
                  <Text style={styles.uploadSubtext}>Tap to select an image (max 2MB)</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Card>
        
        <View style={styles.formSection}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title for your photo"
              placeholderTextColor={Colors.text.tertiary}
              maxLength={100} // Limit title length
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a description..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500} // Limit description length
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    category === cat.id && styles.activeCategoryChip
                  ]}
                  onPress={() => setCategory(cat.id as any)}
                >
                  <Text 
                    style={[
                      styles.categoryChipText,
                      category === cat.id && styles.activeCategoryChipText
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={currentTag}
                onChangeText={setCurrentTag}
                placeholder="Add a tag..."
                placeholderTextColor={Colors.text.tertiary}
                onSubmitEditing={handleAddTag}
                maxLength={30} // Limit tag length
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={handleAddTag}
              >
                <Plus size={20} color={Colors.text.inverse} />
              </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      style={styles.removeTagButton}
                      onPress={() => handleRemoveTag(tag)}
                    >
                      <X size={14} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Before & After Photo</Text>
              <Switch
                value={isBeforeAfter}
                onValueChange={setIsBeforeAfter}
                trackColor={{ false: Colors.border.light, true: 'rgba(5, 150, 105, 0.4)' }}
                thumbColor={isBeforeAfter ? Colors.primary : Colors.text.secondary}
              />
            </View>
            
            {isBeforeAfter && (
              <Card style={styles.beforeImageSection}>
                <Text style={styles.beforeImageLabel}>Before Image</Text>
                {beforeImageUrl ? (
                  <View style={styles.selectedBeforeImageContainer}>
                    <Image 
                      source={{ uri: beforeImageUrl }}
                      style={styles.selectedBeforeImage}
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setBeforeImageUrl('')}
                    >
                      <X size={20} color={Colors.text.inverse} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.uploadBeforeButton}
                    onPress={handleSelectBeforeImage}
                    disabled={isUploadingBefore}
                  >
                    {isUploadingBefore ? (
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    ) : (
                      <>
                        <Upload size={24} color={Colors.text.secondary} />
                        <Text style={styles.uploadBeforeText}>Upload Before Photo (max 2MB)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </Card>
            )}
          </View>
        </View>
        
        <Button
          title="Save Photo"
          style={styles.saveButton}
          onPress={handleSavePhoto}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  imageSection: {
    marginBottom: 24,
    padding: 0,
    overflow: 'hidden',
  },
  uploadButton: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: 16,
  },
  uploadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  selectedImageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  activeCategoryChip: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: Colors.primary,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    marginRight: 8,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  removeTagButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  beforeImageSection: {
    padding: 16,
  },
  beforeImageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  uploadBeforeButton: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: 8,
  },
  uploadBeforeText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  selectedBeforeImageContainer: {
    position: 'relative',
  },
  selectedBeforeImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  saveButton: {
    marginBottom: 24,
  },
});