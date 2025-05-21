import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search, Filter, Plus, Clock, Eye } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';

// Mock data for videos
const mockVideos = [
  {
    id: '1',
    title: "Full Body HIIT Workout",
    description: "30-minute high intensity interval training for full body.",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000",
    duration: "30:00",
    level: "intermediate",
    category: "HIIT",
    tags: ["full body", "hiit", "cardio"],
    uploadDate: "2023-05-15T10:00:00Z",
    views: 1245,
    trainerId: "1",
    isPublic: true,
  },
  {
    id: '2',
    title: "Beginner Guide to Weight Training",
    description: "Learn the basics of weight training with proper form.",
    thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000",
    duration: "45:00",
    level: "beginner",
    category: "Strength",
    tags: ["beginner", "weights", "strength"],
    uploadDate: "2023-06-20T14:30:00Z",
    views: 2567,
    trainerId: "1",
    isPublic: true,
  },
  {
    id: '3',
    title: "Yoga for Flexibility",
    description: "Improve your flexibility with this yoga routine.",
    thumbnailUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1000",
    duration: "25:00",
    level: "beginner",
    category: "Yoga",
    tags: ["yoga", "flexibility", "relaxation"],
    uploadDate: "2023-07-05T09:15:00Z",
    views: 1876,
    trainerId: "1",
    isPublic: true,
  },
  {
    id: '4',
    title: "Core Strengthening Workout",
    description: "Build a stronger core with these targeted exercises.",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000",
    duration: "20:00",
    level: "intermediate",
    category: "Core",
    tags: ["core", "abs", "strength"],
    uploadDate: "2023-08-12T16:45:00Z",
    views: 1543,
    trainerId: "1",
    isPublic: true,
  },
  {
    id: '5',
    title: "Upper Body Strength",
    description: "Focus on building upper body strength and definition.",
    thumbnailUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000",
    duration: "35:00",
    level: "intermediate",
    category: "Strength",
    tags: ["upper body", "strength", "muscle"],
    uploadDate: "2023-09-03T11:20:00Z",
    views: 1122,
    trainerId: "1",
    isPublic: true,
  },
  {
    id: '6',
    title: "Cardio Blast",
    description: "High-energy cardio workout to boost your heart rate.",
    thumbnailUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=1000",
    duration: "25:00",
    level: "advanced",
    category: "Cardio",
    tags: ["cardio", "fat burn", "endurance"],
    uploadDate: "2023-10-18T08:30:00Z",
    views: 987,
    trainerId: "1",
    isPublic: true,
  },
];

export default function VideoLibraryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isTrainer = user?.role === 'trainer';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState(mockVideos);
  const [filteredVideos, setFilteredVideos] = useState(mockVideos);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Categories derived from video data
  const categories = ['All', ...Array.from(new Set(mockVideos.map(video => video.category)))];
  
  useEffect(() => {
    // Filter videos based on search query and selected category
    let filtered = videos;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(query) || 
        video.description.toLowerCase().includes(query) ||
        video.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }
    
    setFilteredVideos(filtered);
  }, [searchQuery, selectedCategory, videos]);
  
  const handleVideoPress = (videoId: string) => {
    router.push(`/trainer/video/${videoId}`);
  };
  
  const handleAddVideo = () => {
    // Navigate to add video screen
    router.push('/trainer/edit-video/new');
  };
  
  return (
    <View style={[layout.screen, styles.container]}>
      <Stack.Screen 
        options={{
          title: "Video Library",
          headerRight: () => (
            isTrainer ? (
              <TouchableOpacity onPress={handleAddVideo}>
                <Plus size={24} color={Colors.primary} />
              </TouchableOpacity>
            ) : null
          ),
        }} 
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      <FlatList
        data={filteredVideos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.videoCard}
            onPress={() => handleVideoPress(item.id)}
          >
            <View style={styles.thumbnailContainer}>
              <Image 
                source={{ uri: item.thumbnailUrl }}
                style={styles.thumbnail}
              />
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
              <View style={[
                styles.levelBadge, 
                item.level === 'beginner' ? styles.beginnerBadge : 
                item.level === 'intermediate' ? styles.intermediateBadge : 
                styles.advancedBadge
              ]}>
                <Text style={styles.levelText}>{item.level}</Text>
              </View>
            </View>
            
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.videoDescription} numberOfLines={2}>{item.description}</Text>
              
              <View style={styles.videoMeta}>
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.text.secondary} />
                  <Text style={styles.metaText}>
                    {new Date(item.uploadDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Eye size={14} color={Colors.text.secondary} />
                  <Text style={styles.metaText}>{item.views} views</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.videoList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No videos found</Text>
            <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: Colors.text.primary,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Colors.text.inverse,
  },
  videoList: {
    paddingBottom: 16,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  thumbnailContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: Colors.text.inverse,
    fontSize: 12,
    fontWeight: '500',
  },
  levelBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  beginnerBadge: {
    backgroundColor: 'rgba(5, 150, 105, 0.8)',
  },
  intermediateBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.8)',
  },
  advancedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  levelText: {
    color: Colors.text.inverse,
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});