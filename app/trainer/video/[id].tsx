import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Video } from '@/types';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { ThumbsUp, MessageCircle, Share2, Edit, ArrowLeft, Play } from 'lucide-react-native';
import { Button } from '@/components/Button';

// Mock data for videos
const mockVideos: Video[] = [
  {
    id: '1',
    title: "Full Body HIIT Workout",
    description: "30-minute high intensity interval training for full body. This workout is designed to burn calories and improve cardiovascular fitness while building strength throughout your entire body. No equipment needed, just your bodyweight and determination!",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000",
    videoUrl: "https://example.com/video1.mp4",
    duration: "30:00",
    level: "intermediate",
    category: "HIIT",
    tags: ["full body", "hiit", "cardio"],
    createdAt: "2023-05-15T10:00:00Z",
    views: 1245,
    likes: 89,
    trainerId: "1",
  },
  {
    id: '2',
    title: "Beginner Guide to Weight Training",
    description: "Learn the basics of weight training with proper form. This comprehensive guide covers all the fundamental movements and techniques you need to know to start your strength training journey safely and effectively.",
    thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000",
    videoUrl: "https://example.com/video2.mp4",
    duration: "45:00",
    level: "beginner",
    category: "Strength",
    tags: ["beginner", "weights", "strength"],
    createdAt: "2023-06-20T14:30:00Z",
    views: 2567,
    likes: 156,
    trainerId: "1",
  },
  {
    id: '3',
    title: "Yoga for Flexibility",
    description: "Improve your flexibility with this yoga routine. This gentle sequence focuses on opening tight areas of the body and increasing your range of motion through held poses and mindful breathing.",
    thumbnailUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1000",
    videoUrl: "https://example.com/video3.mp4",
    duration: "25:00",
    level: "beginner",
    category: "Yoga",
    tags: ["yoga", "flexibility", "relaxation"],
    createdAt: "2023-07-05T09:15:00Z",
    views: 1876,
    likes: 132,
    trainerId: "1",
  },
  {
    id: '4',
    title: "Core Strengthening Workout",
    description: "Build a stronger core with these targeted exercises. This workout focuses on all aspects of your core - not just the abs but also the obliques, lower back, and deep stabilizing muscles that support your spine.",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000",
    videoUrl: "https://example.com/video4.mp4",
    duration: "20:00",
    level: "intermediate",
    category: "Core",
    tags: ["core", "abs", "strength"],
    createdAt: "2023-08-12T16:45:00Z",
    views: 1543,
    likes: 98,
    trainerId: "1",
  },
];

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  
  useEffect(() => {
    // Find the video by id
    const foundVideo = mockVideos.find(v => v.id === id);
    if (foundVideo) {
      setVideo(foundVideo);
      setLikeCount(foundVideo.likes);
    }
  }, [id]);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };
  
  const handleEdit = () => {
    if (video) {
      router.push(`/trainer/edit-video/${video.id}`);
    }
  };
  
  const handleShare = () => {
    // Share functionality would go here
    console.log('Share video');
  };
  
  const handleBack = () => {
    router.back();
  };
  
  if (!video) {
    return (
      <View style={[layout.screen, layout.center]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <View style={styles.videoContainer}>
        <Image 
          source={{ uri: video.thumbnailUrl }}
          style={styles.thumbnail}
        />
        <TouchableOpacity style={styles.playButton}>
          <Play size={40} color={Colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{video.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Duration:</Text>
            <Text style={styles.metaValue}>{video.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Level:</Text>
            <Text style={styles.metaValue}>{video.level}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>{video.category}</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <Text style={styles.viewCount}>{video.views} views</Text>
          <Text style={styles.dateText}>{new Date(video.createdAt).toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={handleLike}
          >
            <ThumbsUp size={20} color={isLiked ? Colors.primary : Colors.text.secondary} />
            <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>{likeCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color={Colors.text.secondary} />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Share2 size={20} color={Colors.text.secondary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEdit}
          >
            <Edit size={20} color={Colors.text.secondary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{video.description}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Tags</Text>
        <View style={styles.tagsContainer}>
          {video.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        <Button
          title="Back to Video Library"
          onPress={() => router.push('/trainer/videos')}
          variant="outline"
          style={styles.backToLibraryButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
  },
  loadingText: {
    color: Colors.text.primary,
    fontSize: 16,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    marginRight: 16,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewCount: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionButtonActive: {
    // No background change needed
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  actionTextActive: {
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 16,
  },
  sectionTitle: {
    ...typography.h5,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
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
  },
  backToLibraryButton: {
    marginBottom: 24,
  },
});