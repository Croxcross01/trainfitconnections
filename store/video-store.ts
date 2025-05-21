import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl?: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  uploadDate?: string;
  createdAt?: string;
  views: number;
  trainerId: string;
  isPublic: boolean;
  likes?: number;
}

interface VideoState {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchVideos: () => Promise<void>;
  getVideoById: (id: string) => Video | undefined;
  addVideo: (video: Omit<Video, 'id' | 'uploadDate' | 'views' | 'likes'>) => Promise<void>;
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  incrementViews: (id: string) => void;
}

// Mock videos data
const mockVideos: Video[] = [
  {
    id: '1',
    title: "Full Body HIIT Workout",
    description: "30-minute high intensity interval training for full body. This workout is designed to burn calories and improve cardiovascular fitness while building strength throughout your entire body. No equipment needed, just your bodyweight and determination!",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000",
    videoUrl: "https://example.com/video1.mp4",
    duration: "30:00",
    level: "intermediate",
    category: "workout",
    tags: ["full body", "hiit", "cardio"],
    uploadDate: "2023-05-15T10:00:00Z",
    views: 1245,
    trainerId: "1",
    isPublic: true,
    likes: 89,
  },
  {
    id: '2',
    title: "Beginner Guide to Weight Training",
    description: "Learn the basics of weight training with proper form. This comprehensive guide covers all the fundamental movements and techniques you need to know to start your strength training journey safely and effectively.",
    thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000",
    videoUrl: "https://example.com/video2.mp4",
    duration: "45:00",
    level: "beginner",
    category: "tutorial",
    tags: ["beginner", "weights", "strength"],
    uploadDate: "2023-06-20T14:30:00Z",
    views: 2567,
    trainerId: "1",
    isPublic: true,
    likes: 156,
  },
  {
    id: '3',
    title: "Yoga for Flexibility",
    description: "Improve your flexibility with this yoga routine. This gentle sequence focuses on opening tight areas of the body and increasing your range of motion through held poses and mindful breathing.",
    thumbnailUrl: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1000",
    videoUrl: "https://example.com/video3.mp4",
    duration: "25:00",
    level: "beginner",
    category: "workout",
    tags: ["yoga", "flexibility", "relaxation"],
    uploadDate: "2023-07-05T09:15:00Z",
    views: 1876,
    trainerId: "1",
    isPublic: true,
    likes: 132,
  },
  {
    id: '4',
    title: "Core Strengthening Workout",
    description: "Build a stronger core with these targeted exercises. This workout focuses on all aspects of your core - not just the abs but also the obliques, lower back, and deep stabilizing muscles that support your spine.",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000",
    videoUrl: "https://example.com/video4.mp4",
    duration: "20:00",
    level: "intermediate",
    category: "workout",
    tags: ["core", "abs", "strength"],
    uploadDate: "2023-08-12T16:45:00Z",
    views: 1543,
    trainerId: "1",
    isPublic: true,
    likes: 98,
  },
  {
    id: '5',
    title: "Upper Body Strength",
    description: "Focus on building upper body strength and definition. This workout targets your chest, shoulders, back, and arms with a series of compound and isolation exercises.",
    thumbnailUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000",
    videoUrl: "https://example.com/video5.mp4",
    duration: "35:00",
    level: "intermediate",
    category: "workout",
    tags: ["upper body", "strength", "muscle"],
    uploadDate: "2023-09-03T11:20:00Z",
    views: 1122,
    trainerId: "1",
    isPublic: true,
    likes: 76,
  },
  {
    id: '6',
    title: "Cardio Blast",
    description: "High-energy cardio workout to boost your heart rate. This session will get you sweating with a mix of jumping jacks, high knees, burpees, and more to improve your cardiovascular endurance.",
    thumbnailUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=1000",
    videoUrl: "https://example.com/video6.mp4",
    duration: "25:00",
    level: "advanced",
    category: "workout",
    tags: ["cardio", "fat burn", "endurance"],
    uploadDate: "2023-10-18T08:30:00Z",
    views: 987,
    trainerId: "1",
    isPublic: true,
    likes: 65,
  },
];

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: mockVideos,
      isLoading: false,
      error: null,
      
      fetchVideos: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, we would fetch from an API
          // For demo, we'll just use our mock data
          set({ videos: mockVideos, isLoading: false });
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch videos", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      getVideoById: (id) => {
        return get().videos.find(video => video.id === id);
      },
      
      addVideo: async (videoData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newVideo: Video = {
            ...videoData,
            id: Date.now().toString(), // Generate a unique ID
            uploadDate: new Date().toISOString(),
            views: 0,
            likes: 0,
          };
          
          set(state => ({
            videos: [...state.videos, newVideo],
            isLoading: false
          }));
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to add video", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      updateVideo: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            videos: state.videos.map(video => 
              video.id === id ? { ...video, ...updates } : video
            ),
            isLoading: false
          }));
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to update video", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      deleteVideo: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set(state => ({
            videos: state.videos.filter(video => video.id !== id),
            isLoading: false
          }));
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to delete video", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      incrementViews: (id) => {
        set(state => ({
          videos: state.videos.map(video => 
            video.id === id ? { ...video, views: video.views + 1 } : video
          )
        }));
      },
    }),
    {
      name: 'video-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);