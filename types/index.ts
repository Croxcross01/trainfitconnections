export type UserRole = 'client' | 'trainer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  location?: Location;
  specialties?: string[];
  certifications?: Certification[] | string[];
  experience?: number; // Years of experience
  rating?: number; // Average rating
  reviewCount?: number; // Number of reviews
  pricing?: {
    oneOnOne: number;
    group: number;
    virtual: number;
  };
  availability?: Availability[] | { days: string[], hours: { start: string, end: string } }[];
  socialLinks?: SocialMedia;
  isVerified?: boolean;
  hourlyRate?: number;
  rateType?: 'hourly' | 'custom';
  customRates?: CustomRate[];
  clients?: string[]; // Array of client IDs
}

export interface CustomRate {
  id: string;
  title: string;
  amount: number;
  description?: string;
}

export interface Client extends User {
  role: 'client';
  goals?: string[];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  healthInfo?: {
    height?: number; // in cm
    weight?: number; // in kg
    medicalConditions?: string[];
  };
  sessionCount?: number; // Number of sessions completed
}

export interface Trainer extends User {
  role: 'trainer';
  specialties: string[];
  certifications: Certification[];
  experience: number; // Years of experience
  rating: number; // Average rating
  reviewCount: number; // Number of reviews
  pricing: {
    oneOnOne: number;
    group: number;
    virtual: number;
  };
  availability: Availability[];
  socialLinks?: SocialMedia;
  isVerified: boolean;
  hourlyRate: number;
  rateType: 'hourly' | 'custom';
  customRates: CustomRate[];
  clients: string[]; // Array of client IDs
}

export interface Certification {
  id: string;
  name: string;
  organization: string;
  year: number;
  expiryDate?: string;
  verified?: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Availability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
}

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
  linkedin?: string;
}

export type SessionType = 'one-on-one' | 'group' | 'virtual' | 'house-call' | 'in-person';

export interface Session {
  id: string;
  trainerId: string;
  clientId: string;
  date: string; // ISO date string
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'declined';
  type: SessionType;
  participantCount?: number; // For group sessions
  notes?: string;
  location?: Location;
  cost?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: 'credit_card' | 'paypal' | 'bank' | 'cash';
  declineReason?: string;
  isNewClient?: boolean; // Flag to indicate if this is a new client
  customRateId?: string; // ID of the custom rate if applicable
}

export interface WorkoutPlan {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  exercises: Exercise[];
  notes?: string;
  status: 'active' | 'completed' | 'archived';
  progress?: number; // Percentage of completion
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // in seconds
  restTime?: number; // in seconds
  videoUrl?: string;
  imageUrl?: string;
  notes?: string;
  category?: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'other';
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface MealPlan {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  meals: Meal[];
  notes?: string;
  status: 'active' | 'completed' | 'archived';
  calorieTarget?: number;
  macroTargets?: {
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
  };
}

export interface Meal {
  id: string;
  name: string;
  description?: string;
  time: string; // Format: "HH:MM"
  foods: Food[];
  notes?: string;
  imageUrl?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories?: number;
  macros?: {
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
  };
}

export interface Food {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  notes?: string;
}

export type ReminderType = 
  | 'session' 
  | 'session_request' 
  | 'session_update' 
  | 'session_scheduled' 
  | 'session_cancelled' 
  | 'session_accepted' 
  | 'session_declined' 
  | 'workout_plan' 
  | 'workout_plan_update' 
  | 'workout_plan_deleted' 
  | 'meal_plan' 
  | 'meal_plan_update' 
  | 'meal_plan_deleted' 
  | 'payment' 
  | 'payment_update' 
  | 'message' 
  | 'tip' 
  | 'general_update' 
  | 'other';

export interface Reminder {
  id: string;
  trainerId?: string;
  clientId?: string;
  senderId?: string;
  senderName?: string;
  senderImage?: string;
  title: string;
  message: string;
  date: string; // ISO date string
  time: string; // Format: "HH:MM"
  isRead: boolean;
  type?: ReminderType;
  relatedId?: string; // ID of related entity (session, workout plan, etc.)
}

export interface Photo {
  id: string;
  trainerId: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: 'results' | 'workout' | 'equipment' | 'facility' | 'other';
  tags?: string[];
  createdAt: string; // ISO date string
  likes: number;
  isBeforeAfter?: boolean;
  beforeImageUrl?: string;
}

export interface Video {
  id: string;
  trainerId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string; // Format: "MM:SS"
  category: string; // More flexible category type
  tags?: string[];
  createdAt: string; // ISO date string
  views: number;
  likes: number;
  isPublic: boolean;
  isPremium?: boolean;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Payment {
  id: string;
  sessionId?: string;
  trainerId: string;
  clientId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit_card' | 'paypal' | 'bank' | 'cash';
  date: string; // ISO date string
  transactionId?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  name: string;
  last4: string;
  isDefault: boolean;
  expiryDate?: string; // Format: "MM/YY"
}

export interface Payout {
  id: string;
  trainerId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'processing' | 'completed' | 'failed';
  method: {
    id: string;
    type: 'card' | 'bank' | 'paypal';
    name: string;
    last4: string;
  };
  requestDate: string; // ISO date string
  processedDate?: string; // ISO date string
  estimatedArrivalDate?: string; // ISO date string
}

export interface Revenue {
  trainerId?: string;
  totalEarnings: number;
  availableBalance: number;
  pendingPayouts: number;
  currentMonth: {
    earnings: number;
    sessionsCompleted: number;
    clientCount: number;
    growth: number; // percentage compared to last month
  };
  lastMonth: {
    earnings: number;
    sessionsCompleted: number;
    clientCount: number;
    growth: number;
  };
  revenueByType: {
    type: string;
    amount: number;
    percentage: number;
  }[];
  monthlyRevenue: {
    month: string;
    amount: number;
  }[];
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  attachments?: {
    type: 'image' | 'video' | 'document';
    url: string;
    name?: string;
    size?: number;
  }[];
}

export interface MessageThread {
  id: string;
  participants: string[]; // User IDs
  lastMessage: {
    content: string;
    timestamp: string; // ISO date string
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  renewalDate?: string; // ISO date string
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  paymentMethod: {
    id: string;
    type: 'card' | 'bank' | 'paypal';
    name: string;
    last4: string;
  };
}

export interface Review {
  id: string;
  trainerId: string;
  clientId: string;
  rating: number; // 1-5
  comment?: string;
  date: string; // ISO date string
  isPublic: boolean;
  sessionId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  timestamp: string; // ISO date string
  action?: {
    type: string;
    payload: any;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

export interface ClientState {
  profile: Client | null;
  workoutPlans: WorkoutPlan[];
  mealPlans: MealPlan[];
  sessions: Session[];
  reminders: Reminder[];
  nearbyTrainers: Trainer[];
  favoriteTrainers: string[]; // Trainer IDs
  isLoading: boolean;
  error: string | null;
  
  // Profile management
  updateProfile: (profileData: Partial<Client>) => Promise<void>;
  
  // Session management
  bookSession: (sessionData: Omit<Session, 'id'>) => Promise<void>;
  cancelSession: (sessionId: string) => void;
  
  // Trainer management
  searchTrainers: (query: string, filters?: any) => Promise<Trainer[]>;
  addToFavorites: (trainerId: string) => void;
  removeFromFavorites: (trainerId: string) => void;
  
  // Reminders
  getReminders: () => Promise<void>;
  markReminderAsRead: (reminderId: string) => void;
}

export interface TrainerState {
  profile: Trainer | null;
  clients: Client[];
  sessions: Session[];
  workoutPlans: WorkoutPlan[];
  mealPlans: MealPlan[];
  reminders: Reminder[];
  photos: Photo[];
  videos: Video[];
  payments: Payment[];
  revenue: Revenue;
  isLoading: boolean;
  error: string | null;
  
  // Profile management
  updateProfile: (profileData: Partial<Trainer>) => Promise<void>;
  
  // Client management
  addClient: (client: Client) => void;
  removeClient: (clientId: string) => void;
  
  // Session management
  scheduleSession: (sessionData: Omit<Session, 'id'>) => void;
  cancelSession: (sessionId: string) => void;
  
  // Workout plans
  createWorkoutPlan: (planData: Omit<WorkoutPlan, 'id' | 'createdAt'>) => void;
  updateWorkoutPlan: (planId: string, updates: Partial<WorkoutPlan>) => void;
  deleteWorkoutPlan: (planId: string) => void;
  
  // Meal plans
  createMealPlan: (planData: Omit<MealPlan, 'id' | 'createdAt'>) => void;
  updateMealPlan: (planId: string, updates: Partial<MealPlan>) => void;
  deleteMealPlan: (planId: string) => void;
  
  // Reminders
  createReminder: (reminderData: Omit<Reminder, 'id'>) => Reminder;
  markReminderAsRead: (reminderId: string) => void;
  
  // Media
  addPhoto: (photoData: Omit<Photo, 'id' | 'createdAt' | 'likes'>) => void;
  addVideo: (videoData: Omit<Video, 'id' | 'createdAt' | 'views' | 'likes'>) => void;
  
  // Payments
  recordPayment: (paymentData: Omit<Payment, 'id' | 'date'>) => void;
  getRevenue: (period?: 'day' | 'week' | 'month' | 'year' | 'all') => Promise<Revenue>;
}