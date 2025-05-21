import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { X, Plus, Camera, Trash2, Upload, Video as VideoIcon } from 'lucide-react-native';
import { Video } from '@/types';
import * as DocumentPicker from 'expo-document-picker';
import { useVideoStore } from '@/store/video-store';

// Updated mock data for videos with string duration and string category
const mockVideos: Video[] = [
  {
    id: '1',
    title: "Full Body HIIT Workout",
    description: "30-minute high intensity interval training for full body",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000",
    videoUrl: "https://example.com/video1.mp4",
    duration: "30:00", // String duration
    level: "intermediate",
    category: "workout", // Updated to match Video interface
    tags: ["full body", "hiit", "cardio"],
    createdAt: "2023-05-15T10:00:00Z",
    views: 1245,
    likes: 89,
    trainerId: "1",
    isPublic: true,
  },
  {
    id: '2',
    title: "Beginner Guide to Weight Training",
    description: "Learn the basics of weight training with proper form",
    thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000",
    videoUrl: "https://example.com/video2.mp4",
    duration: "45:00", // String duration
    level: "beginner",
    category: "tutorial", // Updated to match Video interface
    tags: ["beginner", "weights", "strength"],
    createdAt: "2023-06-20T14:30:00Z",
    views: 2567,
    likes: 156,
    trainerId: "1",
    isPublic: true,
  },
  {
    id: '3',
    title: "Yoga for Flexibility",
    description: "Improve your flexibility with this yoga routine",
    thumbnailUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1000",
    videoUrl: "https://example.com/video3.mp4",
    duration: "25:00", // String duration
    level: "beginner",
    category: "workout", // Updated to match Video interface
    tags: ["yoga", "flexibility", "relaxation"],
    createdAt: "2023-07-05T09:15:00Z",
    views: 1876,
    likes: 132,
    trainerId: "1",
    isPublic: true,
  },
  {
    id: '4',
    title: "Core Strengthening Workout",
    description: "Build a stronger core with these targeted exercises",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000",
    videoUrl: "https://example.com/video4.mp4",
    duration: "20:00", // String duration
    level: "intermediate",
    category: "workout", // Updated to match Video interface
    tags: ["core", "abs", "strength"],
    createdAt: "2023-08-12T16:45:00Z",
    views: 1543,
    likes: 98,
    trainerId: "1",
    isPublic: true,
  },
];

// Updated categories to match Video interface
const categories = [
  "workout", "tutorial", "motivation", "other"
];

const levels = ["beginner", "intermediate", "advanced"];

export default function EditVideoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isNewVideo = id === 'new';
  const { addVideo, updateVideo, getVideoById } = useVideoStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [category, setCategory] = useState('workout'); // Default to 'workout'
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // New state for video file
  const [videoFile, setVideoFile] = useState<{
    name: string;
    uri: string;
    size?: number;
    mimeType?: string;
  } | null>(null);
  
  useEffect(() => {
    if (!isNewVideo) {
      // Find the video by id
      const foundVideo = getVideoById(id as string);
      if (foundVideo) {
        setTitle(foundVideo.title);
        setDescription(foundVideo.description);
        setThumbnailUrl(foundVideo.thumbnailUrl);
        setDuration(foundVideo.duration);
        setLevel(foundVideo.level);
        setCategory(foundVideo.category);
        setTags(foundVideo.tags);
      }
    }
  }, [id, isNewVideo, getVideoById]);
  
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      // Limit the number of tags to 10
      if (tags.length >= 10) {
        Alert.alert("Limit Reached", "You can add a maximum of 10 tags.");
        return;
      }
      
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/mp4',
        copyToCacheDirectory: false, // Don't copy to reduce memory usage
      });
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0];
      
      // Check file size (limit to 50MB)
      const fileSize = file.size || 0;
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (fileSize > maxSize) {
        Alert.alert(
          "File Too Large", 
          `The selected video is ${(fileSize / (1024 * 1024)).toFixed(2)}MB. Maximum allowed size is 50MB. Please select a smaller video or compress this one.`
        );
        return;
      }
      
      // Store only essential information to reduce memory usage
      setVideoFile({
        name: file.name,
        uri: file.uri,
        size: file.size,
        mimeType: file.mimeType,
      });
      
      // If no duration is set yet, try to extract it from the filename
      // This is just a fallback, in a real app you'd want to use a media library
      // to get the actual duration of the video
      if (!duration && file.name) {
        const durationMatch = file.name.match(/(\d+)min/i);
        if (durationMatch && durationMatch[1]) {
          const minutes = parseInt(durationMatch[1], 10);
          setDuration(`${minutes}:00`);
        }
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video file');
    }
  };
  
  const removeVideoFile = () => {
    setVideoFile(null);
  };
  
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a description");
      return;
    }
    
    if (!thumbnailUrl.trim()) {
      Alert.alert("Error", "Please add a thumbnail");
      return;
    }
    
    if (!duration.trim()) {
      Alert.alert("Error", "Please enter a duration");
      return;
    }
    
    if (!category.trim()) {
      Alert.alert("Error", "Please select a category");
      return;
    }
    
    if (!videoFile && isNewVideo) {
      Alert.alert("Error", "Please upload a video file");
      return;
    }
    
    // Check if description is too long
    if (description.length > 1000) {
      Alert.alert("Error", "Description is too long. Maximum 1000 characters allowed.");
      return;
    }
    
    // Check payload size before saving
    const videoData = {
      title,
      description,
      thumbnailUrl,
      videoUrl: videoFile ? "https://example.com/video.mp4" : "https://example.com/video.mp4",
      duration,
      level,
      category,
      tags,
      trainerId: "1", // In a real app, this would come from auth
      isPublic: false, // Default to private
    };
    
    // Estimate payload size
    const payloadSize = new Blob([JSON.stringify(videoData)]).size;
    const maxSize = 1 * 1024 * 1024; // 1MB
    
    if (payloadSize > maxSize) {
      Alert.alert(
        "Data Too Large", 
        "The video data is too large. Please use shorter descriptions and fewer tags."
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would upload the video file to a server here
      // For this demo, we'll just simulate it
      
      // Simulate file upload delay
      if (videoFile) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      if (isNewVideo) {
        await addVideo(videoData);
        Alert.alert(
          "Success", 
          "Video created successfully",
          [
            {
              text: "OK",
              onPress: () => router.push('/trainer/videos')
            }
          ]
        );
      } else {
        await updateVideo(id as string, videoData);
        Alert.alert(
          "Success", 
          "Video updated successfully",
          [
            {
              text: "OK",
              onPress: () => router.push('/trainer/videos')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert('Error', 'Failed to save video');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Video",
      "Are you sure you want to delete this video? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            setIsLoading(true);
            // Simulate API call
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert(
                "Success", 
                "Video deleted successfully",
                [
                  {
                    text: "OK",
                    onPress: () => router.push('/trainer/videos')
                  }
                ]
              );
            }, 1000);
          },
          style: "destructive"
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen 
        options={{
          title: isNewVideo ? "Add New Video" : "Edit Video",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.formContainer}>
        <Text style={styles.label}>Title</Text>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="Enter video title"
          style={styles.input}
          maxLength={100} // Limit title length
        />
        
        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter video description"
          placeholderTextColor={Colors.text.tertiary}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          maxLength={1000} // Limit description length
        />
        <Text style={styles.charCount}>{description.length}/1000</Text>
        
        <Text style={styles.label}>Thumbnail</Text>
        {thumbnailUrl ? (
          <View style={styles.thumbnailContainer}>
            <Image 
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
            />
            <TouchableOpacity 
              style={styles.removeThumbnailButton}
              onPress={() => setThumbnailUrl('')}
            >
              <X size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addThumbnailButton}
            onPress={() => setThumbnailUrl('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000')}
          >
            <Camera size={24} color={Colors.text.primary} />
            <Text style={styles.addThumbnailText}>Add Thumbnail (max 5MB)</Text>
          </TouchableOpacity>
        )}
        
        {/* New Video File Upload Section */}
        <Text style={styles.label}>Video File (MP4)</Text>
        {videoFile ? (
          <View style={styles.videoFileContainer}>
            <View style={styles.videoFileInfo}>
              <VideoIcon size={24} color={Colors.primary} />
              <View style={styles.videoFileDetails}>
                <Text style={styles.videoFileName} numberOfLines={1} ellipsizeMode="middle">
                  {videoFile.name}
                </Text>
                <Text style={styles.videoFileSize}>
                  {videoFile.size ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.removeVideoButton}
              onPress={removeVideoFile}
            >
              <Trash2 size={20} color={Colors.status.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.uploadVideoButton}
            onPress={pickVideo}
          >
            <Upload size={24} color={Colors.text.primary} />
            <Text style={styles.uploadVideoText}>Upload MP4 Video (max 50MB)</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.label}>Duration (mm:ss)</Text>
        <Input
          value={duration}
          onChangeText={setDuration}
          placeholder="e.g. 30:00"
          style={styles.input}
          maxLength={10} // Limit duration length
        />
        
        <Text style={styles.label}>Level</Text>
        <View style={styles.optionsContainer}>
          {levels.map((l) => (
            <TouchableOpacity
              key={l}
              style={[
                styles.optionButton,
                level === l && styles.optionButtonSelected
              ]}
              onPress={() => setLevel(l as 'beginner' | 'intermediate' | 'advanced')}
            >
              <Text 
                style={[
                  styles.optionText,
                  level === l && styles.optionTextSelected
                ]}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonSelected
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextSelected
                ]}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagInputContainer}>
          <Input
            value={currentTag}
            onChangeText={setCurrentTag}
            placeholder="Add a tag"
            style={styles.tagInput}
            maxLength={30} // Limit tag length
          />
          <TouchableOpacity 
            style={styles.addTagButton}
            onPress={handleAddTag}
          >
            <Plus size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity
                style={styles.removeTagButton}
                onPress={() => handleRemoveTag(tag)}
              >
                <X size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Save"
          onPress={handleSave}
          isLoading={isLoading}
          style={styles.saveButton}
        />
        
        {!isNewVideo && (
          <Button
            title="Delete Video"
            onPress={handleDelete}
            variant="destructive"
            style={styles.deleteButton}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
    padding: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    ...typography.label,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 4,
    fontSize: 16,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'right',
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  removeThumbnailButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addThumbnailButton: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderStyle: 'dashed',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addThumbnailText: {
    color: Colors.text.primary,
    marginTop: 8,
    fontSize: 16,
  },
  // New styles for video file upload
  videoFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  videoFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  videoFileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  videoFileName: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  videoFileSize: {
    color: Colors.text.secondary,
    fontSize: 14,
    marginTop: 4,
  },
  removeVideoButton: {
    padding: 8,
  },
  uploadVideoButton: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderStyle: 'dashed',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadVideoText: {
    color: Colors.text.primary,
    marginTop: 8,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: 8,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    color: Colors.text.primary,
  },
  optionTextSelected: {
    color: Colors.text.inverse,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.text.primary,
  },
  categoryTextSelected: {
    color: Colors.text.inverse,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  addTagButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
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
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginBottom: 40,
  },
  saveButton: {
    marginBottom: 16,
  },
  deleteButton: {
    marginBottom: 16,
  },
});