import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trainer, Session, WorkoutPlan, MealPlan, Reminder, Payment, ReminderType, Certification, Availability, Client, CustomRate } from '@/types';
import { useAuthStore } from './auth-store';
import { useTrainerStore } from './trainer-store';
import { Alert } from 'react-native';

interface ClientState {
  nearbyTrainers: Trainer[];
  favoriteTrainers: string[];
  sessions: Session[];
  workoutPlans: WorkoutPlan[];
  mealPlans: MealPlan[];
  reminders: Reminder[];
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  lastRefreshed: number;
  
  // Trainer discovery
  searchTrainers: (query: string, filters?: any) => void;
  fetchNearbyTrainers: (latitude: number, longitude: number) => Promise<void>;
  toggleFavoriteTrainer: (trainerId: string) => void;
  
  // Session management
  bookSession: (session: Omit<Session, 'id'>) => Session;
  cancelSession: (sessionId: string) => void;
  
  // Payment management
  makePayment: (sessionId: string, amount: number, method: string) => Promise<void>;
  
  // Workout plans
  getWorkoutPlans: () => Promise<WorkoutPlan[]>;
  
  // Meal plans
  getMealPlans: () => Promise<MealPlan[]>;
  
  // Reminders
  getReminders: () => Promise<Reminder[]>;
  markReminderAsRead: (reminderId: string) => void;
  deleteReminder: (reminderId: string) => void;
  
  // Debug
  debugTrainers: () => void;
}

// Mock trainers data - will be used as fallback if no registered trainers exist
const mockTrainers: Trainer[] = [
  {
    id: 't1',
    name: 'John Trainer',
    email: 'john@example.com',
    role: 'trainer',
    profileImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000',
    bio: 'Certified personal trainer with 7+ years of experience specializing in strength training and weight loss. I believe in a holistic approach to fitness that combines effective workouts with proper nutrition and recovery.',
    specialties: ['Strength Training', 'Weight Loss', 'HIIT', 'Nutrition'],
    certifications: [
      { id: 'cert1', name: 'NASM Certified Personal Trainer', organization: 'NASM', year: 2018 },
      { id: 'cert2', name: 'ACE Nutrition Specialist', organization: 'ACE', year: 2019 },
      { id: 'cert3', name: 'CrossFit Level 2', organization: 'CrossFit', year: 2020 }
    ],
    experience: 7,
    rating: 4.8,
    reviewCount: 124,
    pricing: {
      oneOnOne: 65,
      group: 30,
      virtual: 50
    },
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: 'Austin, TX'
    },
    socialLinks: {
      instagram: 'johntrainer',
      twitter: 'johntrainer',
      facebook: 'john.trainer.fitness',
      website: 'johntrainer.com'
    },
    availability: [
      { day: 'monday', startTime: '08:00', endTime: '18:00' },
      { day: 'tuesday', startTime: '08:00', endTime: '18:00' },
      { day: 'wednesday', startTime: '08:00', endTime: '18:00' },
      { day: 'thursday', startTime: '08:00', endTime: '18:00' },
      { day: 'friday', startTime: '08:00', endTime: '18:00' }
    ],
    isVerified: true,
    hourlyRate: 65,
    rateType: 'hourly',
    customRates: [
      { id: 'rate1', title: '10-Session Package', amount: 550, description: 'Save $100 when you buy 10 sessions' },
      { id: 'rate2', title: '5-Session Package', amount: 300, description: 'Save $25 when you buy 5 sessions' }
    ],
    clients: ['c1', 'c2', 'c3']
  },
  {
    id: 't2',
    name: 'Sarah Fitness',
    email: 'sarah@example.com',
    role: 'trainer',
    profileImage: 'https://images.unsplash.com/photo-1518310383802-640c2de311b6?q=80&w=1000',
    bio: 'Passionate about helping people achieve their fitness goals. Specializing in functional training and mobility work. I focus on creating sustainable fitness habits that fit into your lifestyle.',
    specialties: ['Functional Training', 'Mobility', 'Yoga', 'Pilates'],
    certifications: [
      { id: 'cert1', name: 'ACE Certified Personal Trainer', organization: 'ACE', year: 2019 },
      { id: 'cert2', name: 'RYT-200 Yoga Instructor', organization: 'Yoga Alliance', year: 2020 }
    ],
    experience: 5,
    rating: 4.9,
    reviewCount: 98,
    pricing: {
      oneOnOne: 55,
      group: 25,
      virtual: 45
    },
    location: {
      latitude: 30.2982,
      longitude: -97.7481,
      address: 'Austin, TX'
    },
    socialLinks: {
      instagram: 'sarahfitness',
      facebook: 'sarah.fitness',
      website: 'sarahfitness.com'
    },
    availability: [
      { day: 'monday', startTime: '07:00', endTime: '19:00' },
      { day: 'wednesday', startTime: '07:00', endTime: '19:00' },
      { day: 'friday', startTime: '07:00', endTime: '19:00' },
      { day: 'saturday', startTime: '07:00', endTime: '19:00' }
    ],
    isVerified: true,
    hourlyRate: 55,
    rateType: 'custom',
    customRates: [
      { id: 'rate1', title: 'Monthly Unlimited', amount: 450, description: 'Unlimited sessions for a full month' },
      { id: 'rate2', title: 'Intro Package', amount: 200, description: '4 sessions to get started' }
    ],
    clients: ['c1', 'c3']
  },
  {
    id: 't3',
    name: 'Mike Strong',
    email: 'mike@example.com',
    role: 'trainer',
    profileImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000',
    bio: 'Former competitive bodybuilder with 10+ years of training experience. I specialize in hypertrophy training and body composition. Let me help you build the physique you want.',
    specialties: ['Bodybuilding', 'Hypertrophy', 'Body Composition', 'Contest Prep'],
    certifications: [
      { id: 'cert1', name: 'ISSA Certified Personal Trainer', organization: 'ISSA', year: 2015 },
      { id: 'cert2', name: 'NASM Nutrition Coach', organization: 'NASM', year: 2017 }
    ],
    experience: 10,
    rating: 4.7,
    reviewCount: 156,
    pricing: {
      oneOnOne: 70,
      group: 35,
      virtual: 55
    },
    location: {
      latitude: 30.2512,
      longitude: -97.7231,
      address: 'Austin, TX'
    },
    socialLinks: {
      instagram: 'mikestrong',
      twitter: 'mikestrong',
      facebook: 'mike.strong.fitness'
    },
    availability: [
      { day: 'tuesday', startTime: '09:00', endTime: '20:00' },
      { day: 'thursday', startTime: '09:00', endTime: '20:00' },
      { day: 'saturday', startTime: '09:00', endTime: '20:00' },
      { day: 'sunday', startTime: '09:00', endTime: '20:00' }
    ],
    isVerified: true,
    hourlyRate: 70,
    rateType: 'hourly',
    customRates: [],
    clients: ['c2', 'c4']
  },
  {
    id: 't4',
    name: 'Lisa Wellness',
    email: 'lisa@example.com',
    role: 'trainer',
    profileImage: 'https://images.unsplash.com/photo-1609899537878-88d5ba429bdb?q=80&w=1000',
    bio: 'Holistic wellness coach focusing on the mind-body connection. I combine fitness training with mindfulness practices to help you achieve overall wellbeing.',
    specialties: ['Holistic Fitness', 'Mindfulness', 'Stress Reduction', 'Nutrition'],
    certifications: [
      { id: 'cert1', name: 'NASM Certified Personal Trainer', organization: 'NASM', year: 2016 },
      { id: 'cert2', name: 'Precision Nutrition Coach', organization: 'Precision Nutrition', year: 2018 },
      { id: 'cert3', name: 'Mindfulness Meditation Teacher', organization: 'Mindful Schools', year: 2019 }
    ],
    experience: 8,
    rating: 4.9,
    reviewCount: 87,
    pricing: {
      oneOnOne: 75,
      group: 40,
      virtual: 60
    },
    location: {
      latitude: 30.3072,
      longitude: -97.7631,
      address: 'Austin, TX'
    },
    socialLinks: {
      instagram: 'lisawellness',
      website: 'lisawellness.com'
    },
    availability: [
      { day: 'monday', startTime: '06:00', endTime: '14:00' },
      { day: 'tuesday', startTime: '06:00', endTime: '14:00' },
      { day: 'wednesday', startTime: '06:00', endTime: '14:00' },
      { day: 'thursday', startTime: '06:00', endTime: '14:00' },
      { day: 'friday', startTime: '06:00', endTime: '14:00' }
    ],
    isVerified: false,
    hourlyRate: 75,
    rateType: 'hourly',
    customRates: [
      { id: 'rate1', title: 'Wellness Package', amount: 350, description: '5 sessions focused on mind-body wellness' }
    ],
    clients: ['c1', 'c5']
  },
  {
    id: 't5',
    name: 'Carlos Cardio',
    email: 'carlos@example.com',
    role: 'trainer',
    profileImage: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1000',
    bio: 'Running coach and cardio specialist. Former marathon runner with a passion for helping others improve their endurance and cardiovascular health.',
    specialties: ['Running', 'Cardio', 'Endurance', 'Marathon Prep'],
    certifications: [
      { id: 'cert1', name: 'RRCA Certified Running Coach', organization: 'RRCA', year: 2018 },
      { id: 'cert2', name: 'ACE Certified Personal Trainer', organization: 'ACE', year: 2017 }
    ],
    experience: 6,
    rating: 4.6,
    reviewCount: 72,
    pricing: {
      oneOnOne: 60,
      group: 30,
      virtual: 50
    },
    location: {
      latitude: 30.2872,
      longitude: -97.7331,
      address: 'Austin, TX'
    },
    socialLinks: {
      instagram: 'carloscardio',
      twitter: 'carloscardio',
      facebook: 'carlos.cardio'
    },
    availability: [
      { day: 'monday', startTime: '05:30', endTime: '12:00' },
      { day: 'wednesday', startTime: '05:30', endTime: '12:00' },
      { day: 'friday', startTime: '05:30', endTime: '12:00' },
      { day: 'saturday', startTime: '05:30', endTime: '12:00' },
      { day: 'sunday', startTime: '05:30', endTime: '12:00' }
    ],
    isVerified: true,
    hourlyRate: 60,
    rateType: 'hourly',
    customRates: [],
    clients: ['c3', 'c4']
  }
];

// Create a session for today
const today = new Date();
const todayString = today.toISOString();

// Mock sessions data
const mockSessions: Session[] = [
  // Today's session
  {
    id: 's1',
    trainerId: 't1',
    clientId: 'c1',
    date: todayString,
    startTime: '15:00',
    endTime: '16:00',
    status: 'scheduled',
    type: 'one-on-one',
    notes: 'Focus on upper body strength',
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: 'Austin Fitness Center, 123 Main St'
    },
    cost: 75,
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    customRateId: undefined
  },
  // Tomorrow's session
  {
    id: 's2',
    trainerId: 't2',
    clientId: 'c1',
    date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    startTime: '10:00',
    endTime: '11:00',
    status: 'scheduled',
    type: 'virtual',
    notes: 'HIIT workout session',
    cost: 65,
    paymentStatus: 'pending',
    paymentMethod: 'paypal',
    customRateId: undefined
  },
  // Pending session
  {
    id: 's3',
    trainerId: 't3',
    clientId: 'c1',
    date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '14:00',
    endTime: '15:00',
    status: 'pending',
    type: 'one-on-one',
    notes: 'First session - focus on assessment and goal setting',
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: 'Austin Fitness Center, 123 Main St'
    },
    cost: 75,
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    customRateId: undefined
  },
  // Today's second session
  {
    id: 's4',
    trainerId: 't4',
    clientId: 'c1',
    date: todayString,
    startTime: '18:00',
    endTime: '19:00',
    status: 'scheduled',
    type: 'one-on-one',
    notes: 'Flexibility and mobility work',
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: 'Austin Fitness Center, 123 Main St'
    },
    cost: 75,
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    customRateId: undefined
  },
  // Past session
  {
    id: 's5',
    trainerId: 't5',
    clientId: 'c1',
    date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '09:00',
    endTime: '10:00',
    status: 'completed',
    type: 'one-on-one',
    notes: 'Strength training session',
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: 'Austin Fitness Center, 123 Main St'
    },
    cost: 75,
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    customRateId: undefined
  },
  // Group session
  {
    id: 's6',
    trainerId: 't1',
    clientId: 'c1',
    date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '17:00',
    endTime: '18:00',
    status: 'scheduled',
    type: 'group',
    participantCount: 5,
    notes: 'Group HIIT session',
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: 'Austin Fitness Center, 123 Main St'
    },
    cost: 45,
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    customRateId: undefined
  },
  // House call session
  {
    id: 's7',
    trainerId: 't2',
    clientId: 'c1',
    date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '08:00',
    endTime: '09:00',
    status: 'scheduled',
    type: 'house-call',
    notes: 'In-home training session',
    location: {
      latitude: 30.3072,
      longitude: -97.7331,
      address: 'Client Home Address'
    },
    cost: 90,
    paymentStatus: 'pending',
    paymentMethod: 'credit_card',
    customRateId: undefined
  },
  // Custom rate session
  {
    id: 's8',
    trainerId: 't1',
    clientId: 'c1',
    date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    startTime: '16:00',
    endTime: '17:00',
    status: 'scheduled',
    type: 'one-on-one',
    notes: 'Session from 10-pack',
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: 'Austin Fitness Center, 123 Main St'
    },
    cost: 55, // Discounted from package
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    customRateId: 'rate1'
  }
];

// Mock reminders data
const mockReminders: Reminder[] = [
  {
    id: 'r1',
    clientId: 'c1',
    trainerId: 't1',
    title: 'Session Reminder',
    message: "Don't forget your training session with John Trainer tomorrow at 3:00 PM. Remember to bring water and wear comfortable clothes.",
    date: new Date().toISOString(),
    time: '09:00',
    isRead: false,
    type: 'session',
    relatedId: 's1'
  },
  {
    id: 'r2',
    clientId: 'c1',
    trainerId: 't2',
    title: 'Session Accepted',
    message: "Sarah Fitness has accepted your session request for tomorrow at 10:00 AM. You'll receive a Zoom link 30 minutes before the session.",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    time: '14:30',
    isRead: true,
    type: 'session_accepted',
    relatedId: 's2'
  },
  {
    id: 'r3',
    clientId: 'c1',
    trainerId: 't5',
    title: 'Payment Confirmation',
    message: "Your payment of $75.00 for the session with Carlos Cardio has been processed successfully.",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    time: '16:45',
    isRead: true,
    type: 'other',
  },
  {
    id: 'r4',
    clientId: 'c1',
    trainerId: 't1',
    title: 'Fitness Tip: Hydration',
    message: "Did you know? Drinking water before, during, and after your workout can improve performance by up to 25%. Try to consume at least 16-20 oz of water 2 hours before exercise.",
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    time: '08:30',
    isRead: false,
    type: 'tip',
  },
  {
    id: 'r5',
    clientId: 'c1',
    trainerId: 't1',
    title: 'Progress Update',
    message: "Great job this month! You've attended 8 sessions and improved your squat form significantly. Keep up the good work!",
    date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    time: '10:15',
    isRead: false,
    type: 'general_update',
  },
];

// Mock payments data
const mockPayments: Payment[] = [
  {
    id: 'p1',
    sessionId: 's1',
    trainerId: 't1',
    clientId: 'c1',
    amount: 75,
    status: 'completed',
    method: 'credit_card',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    transactionId: 'txn_123456789'
  },
  {
    id: 'p2',
    sessionId: 's5',
    trainerId: 't5',
    clientId: 'c1',
    amount: 75,
    status: 'completed',
    method: 'credit_card',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    transactionId: 'txn_987654321'
  },
  {
    id: 'p3',
    sessionId: 's8',
    trainerId: 't1',
    clientId: 'c1',
    amount: 55,
    status: 'completed',
    method: 'credit_card',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    transactionId: 'txn_567891234'
  }
];

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      nearbyTrainers: [],
      favoriteTrainers: ['t1', 't3'],
      sessions: mockSessions,
      workoutPlans: [],
      mealPlans: [],
      reminders: mockReminders,
      payments: mockPayments,
      isLoading: false,
      error: null,
      lastRefreshed: Date.now(),
      
      searchTrainers: (query, filters) => {
        set({ isLoading: true });
        
        // Get all trainers from auth store
        const registeredTrainers = useAuthStore.getState().getTrainers();
        
        // Combine with mock trainers if needed
        const allTrainers = [...registeredTrainers, ...mockTrainers];
        
        // Remove duplicates (in case mock trainers overlap with registered ones)
        const uniqueTrainers = Array.from(new Map(allTrainers.map(trainer => [trainer.id, trainer])).values());
        
        console.log(`Searching among ${uniqueTrainers.length} trainers (${registeredTrainers.length} registered + ${mockTrainers.length} mock)`);
        
        // Simulate API call
        setTimeout(() => {
          // Filter trainers based on query
          const filteredTrainers = uniqueTrainers.filter(trainer => 
            trainer.name.toLowerCase().includes(query.toLowerCase()) ||
            trainer.specialties?.some(s => s.toLowerCase().includes(query.toLowerCase())) ||
            trainer.location?.address.toLowerCase().includes(query.toLowerCase())
          );
          
          set({ 
            nearbyTrainers: filteredTrainers,
            isLoading: false,
            lastRefreshed: Date.now()
          });
        }, 500);
      },
      
      fetchNearbyTrainers: async (latitude, longitude) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get all trainers from auth store
          const registeredTrainers = useAuthStore.getState().getTrainers();
          
          // Process registered trainers to ensure they have all required Trainer properties
          const processedRegisteredTrainers: Trainer[] = registeredTrainers
            .filter(user => user.role === 'trainer')
            .map(user => {
              // Process certifications to ensure they are Certification objects
              const processedCertifications: Certification[] = Array.isArray(user.certifications)
                ? user.certifications.map(cert => {
                    if (typeof cert === 'string') {
                      return {
                        id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                        name: cert,
                        organization: 'Unknown',
                        year: new Date().getFullYear()
                      };
                    } else if (typeof cert === 'object' && cert !== null) {
                      return {
                        id: cert.id || `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                        name: cert.name || 'Unknown Certification',
                        organization: cert.organization || 'Unknown',
                        year: cert.year || new Date().getFullYear()
                      };
                    }
                    return {
                      id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                      name: 'Unknown Certification',
                      organization: 'Unknown',
                      year: new Date().getFullYear()
                    };
                  })
                : [];
              
              // Process availability to ensure it's in the correct format
              const processedAvailability: Availability[] = Array.isArray(user.availability)
                ? user.availability.map(avail => {
                    if (typeof avail === 'object' && avail !== null) {
                      if ('day' in avail && 'startTime' in avail && 'endTime' in avail) {
                        return avail as Availability;
                      } else if ('days' in avail && 'hours' in avail) {
                        // Convert from a different format if needed
                        const day = Array.isArray(avail.days) && avail.days.length > 0 
                          ? avail.days[0].toLowerCase() 
                          : 'monday';
                        
                        return {
                          day: day as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday',
                          startTime: typeof avail.hours === 'object' && avail.hours !== null && 'start' in avail.hours 
                            ? avail.hours.start 
                            : '09:00',
                          endTime: typeof avail.hours === 'object' && avail.hours !== null && 'end' in avail.hours 
                            ? avail.hours.end 
                            : '17:00'
                        };
                      }
                    }
                    return {
                      day: 'monday',
                      startTime: '09:00',
                      endTime: '17:00'
                    };
                  })
                : [];
              
              // Create a properly formatted Trainer object
              return {
                ...user,
                role: 'trainer' as const,
                specialties: user.specialties || [],
                certifications: processedCertifications,
                experience: typeof user.experience === 'number' ? user.experience : 0,
                rating: typeof user.rating === 'number' ? user.rating : 4.5,
                reviewCount: typeof user.reviewCount === 'number' ? user.reviewCount : 0,
                pricing: user.pricing || {
                  oneOnOne: 50,
                  group: 25,
                  virtual: 40
                },
                availability: processedAvailability,
                isVerified: Boolean(user.isVerified),
                hourlyRate: typeof user.hourlyRate === 'number' ? user.hourlyRate : 50,
                rateType: user.rateType || 'hourly',
                customRates: user.customRates || [],
                clients: user.clients || []
              } as Trainer;
            });
          
          // Combine with mock trainers
          const allTrainers = [...processedRegisteredTrainers, ...mockTrainers];
          
          // Remove duplicates (in case mock trainers overlap with registered ones)
          const uniqueTrainers = Array.from(new Map(allTrainers.map(trainer => [trainer.id, trainer])).values());
          
          console.log(`Found ${processedRegisteredTrainers.length} registered trainers and ${mockTrainers.length} mock trainers`);
          console.log(`Total unique trainers: ${uniqueTrainers.length}`);
          
          // In a real app, we would filter trainers based on location
          // For now, we'll just return all trainers
          set({ 
            nearbyTrainers: uniqueTrainers,
            isLoading: false,
            lastRefreshed: Date.now()
          });
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch nearby trainers", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      toggleFavoriteTrainer: (trainerId) => {
        set(state => {
          const isFavorite = state.favoriteTrainers.includes(trainerId);
          
          // Get current user
          const currentUser = useAuthStore.getState().user;
          if (!currentUser) {
            console.error("Cannot toggle favorite: User not logged in");
            return state;
          }
          
          // Get trainer store
          const trainerStore = useTrainerStore.getState();
          
          if (isFavorite) {
            // Remove from favorites
            return {
              favoriteTrainers: state.favoriteTrainers.filter(id => id !== trainerId)
            };
          } else {
            // Add to favorites
            
            // Also add client to trainer's client list if not already there
            const trainer = state.nearbyTrainers.find(t => t.id === trainerId);
            if (trainer) {
              // Check if client is already in trainer's client list
              const isClientAlreadyAdded = trainer.clients?.includes(currentUser.id);
              
              if (!isClientAlreadyAdded) {
                console.log(`Adding client ${currentUser.id} to trainer ${trainerId}'s client list`);
                
                // Create a client object from the current user
                const clientToAdd = {
                  id: currentUser.id,
                  name: currentUser.name,
                  email: currentUser.email,
                  role: 'client' as const,
                  profileImage: currentUser.profileImage,
                  location: currentUser.location,
                  sessionCount: 0,
                  bio: currentUser.bio || "New client"
                };
                
                // Add client to trainer's client list
                trainerStore.addClient(clientToAdd);
                
                // Create a notification for the trainer
                const notification: Omit<Reminder, 'id'> = {
                  trainerId: trainerId,
                  clientId: currentUser.id,
                  title: 'New Potential Client',
                  message: `${currentUser.name} has added you to their favorites! They might be interested in booking a session with you soon.`,
                  date: new Date().toISOString(),
                  time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                  isRead: false,
                  type: 'other'
                };
                
                // Add notification to trainer's reminders
                trainerStore.createReminder(notification);
              }
            }
            
            return {
              favoriteTrainers: [...state.favoriteTrainers, trainerId]
            };
          }
        });
      },
      
      bookSession: (sessionData) => {
        const newSession: Session = {
          ...sessionData,
          id: `s${Date.now()}`,
          status: 'pending'
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession]
        }));
        
        // Get client and trainer information for the notification
        const client = useAuthStore.getState().user;
        const trainer = get().nearbyTrainers.find(t => t.id === sessionData.trainerId);
        
        if (!client || !trainer) {
          console.error("Could not find client or trainer information for notification");
          return newSession;
        }
        
        // Format date for display
        const sessionDate = new Date(sessionData.date);
        const formattedDate = sessionDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
        
        // Create a notification for the trainer
        const trainerReminder: Reminder = {
          id: `r${Date.now()}`,
          trainerId: sessionData.trainerId,
          clientId: sessionData.clientId,
          title: 'New Session Request',
          message: `${client.name} has requested a ${sessionData.type} session on ${formattedDate} at ${sessionData.startTime}. Please accept or decline this request.`,
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'session_request',
          relatedId: newSession.id
        };
        
        // Add the notification to the trainer's store
        try {
          // In a real app, this would be sent to the trainer via an API
          // For now, we'll add it to the trainer store directly
          const trainerStore = useTrainerStore.getState();
          
          // IMPORTANT: This is the key fix - we need to directly call createReminder
          // and ensure it's properly adding the notification to the trainer's store
          const newReminder = trainerStore.createReminder(trainerReminder);
          
          console.log(`Notification sent to trainer ${trainer.name} for session request:`, newReminder);
          
          // Verify the reminder was added to the trainer's store
          const trainerReminders = trainerStore.reminders;
          const reminderExists = trainerReminders.some(r => r.id === newReminder.id);
          console.log(`Reminder exists in trainer store: ${reminderExists}`);
          
          // Alert for debugging
          Alert.alert(
            "Session Request Sent",
            `Your session request has been sent to ${trainer.name}. You'll be notified when they respond.`,
            [{ text: "OK" }]
          );
        } catch (error) {
          console.error("Failed to send notification to trainer:", error);
          Alert.alert(
            "Error",
            "Failed to send notification to trainer. Please try again.",
            [{ text: "OK" }]
          );
        }
        
        // Create a confirmation for the client as well
        const clientReminder: Reminder = {
          id: `r${Date.now() + 1}`,
          trainerId: sessionData.trainerId,
          clientId: sessionData.clientId,
          title: 'Session Request Sent',
          message: `Your session request for ${formattedDate} at ${sessionData.startTime} has been sent to ${trainer.name}. You'll be notified when they respond.`,
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'session_request',
          relatedId: newSession.id
        };
        
        set(state => ({
          reminders: [...state.reminders, clientReminder]
        }));
        
        return newSession;
      },
      
      cancelSession: (sessionId) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return;
        
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? { ...session, status: 'cancelled' } : session
          )
        }));
        
        // Get client and trainer information for the notification
        const client = useAuthStore.getState().user;
        const trainer = get().nearbyTrainers.find(t => t.id === session.trainerId);
        
        if (!client || !trainer) {
          console.error("Could not find client or trainer information for cancellation notification");
          return;
        }
        
        // Format date for display
        const sessionDate = new Date(session.date);
        const formattedDate = sessionDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
        
        // Create a notification for the trainer
        const trainerNotification: Reminder = {
          id: `r${Date.now()}`,
          trainerId: session.trainerId,
          clientId: session.clientId,
          title: 'Session Cancelled',
          message: `${client.name} has cancelled the ${session.type} session scheduled for ${formattedDate} at ${session.startTime}.`,
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'session_cancelled',
          relatedId: sessionId
        };
        
        // Add the notification to the trainer's store
        try {
          // In a real app, this would be sent to the trainer via an API
          // For now, we'll add it to the trainer store directly
          const trainerStore = useTrainerStore.getState();
          trainerStore.createReminder(trainerNotification);
          console.log(`Cancellation notification sent to trainer ${trainer.name}`);
        } catch (error) {
          console.error("Failed to send cancellation notification to trainer:", error);
        }
        
        // Create a confirmation for the client
        const clientNotification: Reminder = {
          id: `r${Date.now() + 1}`,
          trainerId: session.trainerId,
          clientId: session.clientId,
          title: 'Session Cancellation Confirmed',
          message: `Your ${session.type} session with ${trainer.name} scheduled for ${formattedDate} at ${session.startTime} has been cancelled.`,
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'session_cancelled',
          relatedId: sessionId
        };
        
        set(state => ({
          reminders: [...state.reminders, clientNotification]
        }));
      },
      
      makePayment: async (sessionId, amount, method) => {
        set({ isLoading: true, error: null });
        
        try {
          // Validate payment method
          const validMethods = ['credit_card', 'paypal', 'cash', 'bank'];
          const paymentMethod = validMethods.includes(method) 
            ? method as 'credit_card' | 'paypal' | 'cash' | 'bank'
            : 'credit_card'; // Default to credit_card if invalid
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Create a new payment
          const session = get().sessions.find(s => s.id === sessionId);
          if (!session) {
            throw new Error("Session not found");
          }
          
          const payment: Payment = {
            id: `p${Date.now()}`,
            sessionId,
            trainerId: session.trainerId,
            clientId: session.clientId,
            amount,
            status: 'completed',
            method: paymentMethod,
            date: new Date().toISOString(),
            transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`
          };
          
          // Update session payment status
          set(state => ({
            sessions: state.sessions.map(session => 
              session.id === sessionId ? { ...session, paymentStatus: 'paid' } : session
            ),
            payments: [...state.payments, payment]
          }));
          
          // Create a payment confirmation reminder for the client
          const trainer = get().nearbyTrainers.find(t => t.id === session.trainerId);
          
          if (trainer) {
            const clientReminder: Reminder = {
              id: `r${Date.now()}`,
              clientId: session.clientId,
              trainerId: session.trainerId,
              title: 'Payment Confirmation',
              message: `Your payment of $${amount.toFixed(2)} for the session with ${trainer.name} has been processed successfully.`,
              date: new Date().toISOString(),
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              isRead: false,
              type: 'payment',
              relatedId: sessionId
            };
            
            // Create a payment notification for the trainer
            const trainerReminder: Reminder = {
              id: `r${Date.now() + 1}`,
              clientId: session.clientId,
              trainerId: session.trainerId,
              title: 'Payment Received',
              message: `You have received a payment of $${amount.toFixed(2)} for the session on ${new Date(session.date).toLocaleDateString()}.`,
              date: new Date().toISOString(),
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              isRead: false,
              type: 'payment',
              relatedId: sessionId
            };
            
            // Add client notification to client store
            set(state => ({
              reminders: [...state.reminders, clientReminder]
            }));
            
            // Add trainer notification to trainer store
            try {
              const trainerStore = useTrainerStore.getState();
              trainerStore.createReminder(trainerReminder);
              console.log(`Payment notification sent to trainer ${trainer.name}`);
            } catch (error) {
              console.error("Failed to send payment notification to trainer:", error);
            }
          }
          
          set({ isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to process payment", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      getWorkoutPlans: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, this would fetch from an API
          set({ 
            workoutPlans: [],
            isLoading: false 
          });
          
          return [];
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch workout plans", 
            isLoading: false 
          });
          return [];
        }
      },
      
      getMealPlans: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get the current user ID
          const userId = useAuthStore.getState().user?.id;
          if (!userId) {
            throw new Error("User not authenticated");
          }
          
          // Get meal plans from trainer store that are assigned to this client
          const trainerMealPlans = useTrainerStore.getState().mealPlans;
          const clientMealPlans = trainerMealPlans.filter(plan => plan.clientId === userId);
          
          console.log(`Found ${clientMealPlans.length} meal plans for client ${userId}`);
          
          // Update the client store with these meal plans
          set({ 
            mealPlans: clientMealPlans,
            isLoading: false 
          });
          
          return clientMealPlans;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch meal plans", 
            isLoading: false 
          });
          return [];
        }
      },
      
      getReminders: async () => {
        set({ isLoading: true });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, this would fetch from an API
          set({ 
            reminders: mockReminders,
            isLoading: false 
          });
          
          return mockReminders;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch reminders", 
            isLoading: false 
          });
          return [];
        }
      },
      
      markReminderAsRead: (reminderId) => {
        set(state => ({
          reminders: state.reminders.map(reminder => 
            reminder.id === reminderId ? { ...reminder, isRead: true } : reminder
          )
        }));
      },
      
      deleteReminder: (reminderId) => {
        set(state => ({
          reminders: state.reminders.filter(reminder => reminder.id !== reminderId)
        }));
      },
      
      // Debug function to show all trainers
      debugTrainers: () => {
        const registeredTrainers = useAuthStore.getState().getTrainers();
        const nearbyTrainers = get().nearbyTrainers;
        
        console.log("Registered trainers:", registeredTrainers.map(t => ({ id: t.id, email: t.email, name: t.name })));
        console.log("Nearby trainers:", nearbyTrainers.map(t => ({ id: t.id, email: t.email, name: t.name })));
        
        // Show alert with trainer count
        Alert.alert(
          "Debug Trainer Info",
          `Registered trainers: ${registeredTrainers.length}
Nearby trainers: ${nearbyTrainers.length}
Last refreshed: ${new Date(get().lastRefreshed).toLocaleTimeString()}`,
          [
            { 
              text: "Refresh Now", 
              onPress: () => {
                const user = useAuthStore.getState().user;
                if (user?.location) {
                  get().fetchNearbyTrainers(user.location.latitude, user.location.longitude);
                  Alert.alert("Refreshed", "Trainer data has been refreshed");
                } else {
                  Alert.alert("Error", "User location not available");
                }
              } 
            },
            { text: "OK" }
          ]
        );
      }
    }),
    {
      name: 'client-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);