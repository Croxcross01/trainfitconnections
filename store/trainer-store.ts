import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trainer, Session, WorkoutPlan, MealPlan, Reminder, Client, Photo, Payment, ReminderType, Revenue, Payout, PaymentMethod } from '@/types';
import { Alert } from 'react-native';

interface TrainerState {
  clients: Client[];
  sessions: Session[];
  workoutPlans: WorkoutPlan[];
  mealPlans: MealPlan[];
  reminders: Reminder[];
  photos: Photo[];
  payments: Payment[];
  payouts: Payout[];
  revenue: Revenue;
  isLoading: boolean;
  error: string | null;
  
  // Client management
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  removeClient: (clientId: string) => void;
  
  // Session management
  scheduleSession: (session: Omit<Session, 'id'>) => Session;
  updateSession: (sessionId: string, updates: Partial<Session>) => Session | undefined;
  cancelSession: (sessionId: string) => void;
  acceptSession: (sessionId: string, isNewClient?: boolean) => void;
  declineSession: (sessionId: string, reason?: string) => void;
  
  // Workout plans
  createWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => void;
  updateWorkoutPlan: (planId: string, updates: Partial<WorkoutPlan>) => void;
  deleteWorkoutPlan: (planId: string) => void;
  
  // Meal plans
  createMealPlan: (plan: Omit<MealPlan, 'id' | 'createdAt'>) => void;
  updateMealPlan: (planId: string, updates: Partial<MealPlan>) => void;
  deleteMealPlan: (planId: string) => void;
  
  // Reminders
  createReminder: (reminder: Omit<Reminder, 'id'>) => Reminder;
  updateReminder: (reminderId: string, updates: Partial<Reminder>) => void;
  deleteReminder: (reminderId: string) => void;
  markReminderAsRead: (reminderId: string) => void;
  
  // Photos
  addPhoto: (photo: Omit<Photo, 'id' | 'createdAt' | 'likes'>) => void;
  updatePhoto: (photoId: string, updates: Partial<Photo>) => void;
  deletePhoto: (photoId: string) => void;
  likePhoto: (photoId: string) => void;
  
  // Payments
  recordPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
  updatePaymentStatus: (paymentId: string, status: 'pending' | 'completed' | 'failed' | 'refunded') => void;
  fetchPayments: () => Promise<void>;
  
  // Payouts
  requestPayout: (amount: number, paymentMethodId: string) => Promise<Payout>;
  fetchPayouts: () => Promise<void>;
  
  // Revenue
  fetchRevenue: (period?: 'day' | 'week' | 'month' | 'year' | 'all') => Promise<void>;
  generateRevenueForUser: (userId: string) => Promise<void>;
}

// Mock payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    type: 'bank',
    name: 'Chase Bank',
    last4: '4567',
    isDefault: true,
  },
  {
    id: 'pm2',
    type: 'card',
    name: 'Visa',
    last4: '8901',
    isDefault: false,
  }
];

// Mock photos data
const mockPhotos: Photo[] = [
  {
    id: 'p1',
    title: "Client transformation - 12 weeks",
    description: "Amazing results after just 12 weeks of consistent training and nutrition plan",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000",
    category: 'results',
    tags: ['transformation', 'weight-loss', 'strength'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 42,
    trainerId: 't1',
    isBeforeAfter: true,
    beforeImageUrl: "https://images.unsplash.com/photo-1571019613576-2b22c76fd955?q=80&w=1000",
  },
  {
    id: 'p2',
    title: "High-intensity workout session",
    description: "Group training session focusing on HIIT and core strength",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000",
    category: 'workout',
    tags: ['group-training', 'hiit', 'core'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 28,
    trainerId: 't1',
  },
  {
    id: 'p3',
    title: "New gym equipment",
    description: "Just added these new kettlebells to our facility",
    imageUrl: "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?q=80&w=1000",
    category: 'equipment',
    tags: ['kettlebells', 'equipment', 'strength-training'],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 15,
    trainerId: 't1',
  },
  {
    id: 'p4',
    title: "Client strength progress",
    description: "Sarah increased her deadlift by 50lbs in just 2 months",
    imageUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1000",
    category: 'results',
    tags: ['strength', 'deadlift', 'progress'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 36,
    trainerId: 't1',
  },
  {
    id: 'p5',
    title: "Morning yoga session",
    description: "Starting the day with mindfulness and flexibility training",
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000",
    category: 'workout',
    tags: ['yoga', 'flexibility', 'mindfulness'],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 22,
    trainerId: 't1',
  },
  {
    id: 'p6',
    title: "Nutrition workshop",
    description: "Hosted a workshop on meal prep and nutrition basics",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000",
    category: 'other',
    tags: ['nutrition', 'workshop', 'meal-prep'],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 19,
    trainerId: 't1',
  }
];

// Mock reminders data
const mockReminders: Reminder[] = [
  {
    id: 'tr1',
    trainerId: 't1',
    clientId: 'c1',
    title: 'Session Request',
    message: "You have a new session request from Emma Wilson for tomorrow at 10:00 AM. Please accept or decline.",
    date: new Date().toISOString(),
    time: '09:15',
    isRead: false,
    type: 'session_request',
    relatedId: 's3'
  },
  {
    id: 'tr2',
    trainerId: 't1',
    clientId: 'c2',
    title: 'Client Goal Update',
    message: "Michael has updated his fitness goals. He now wants to focus more on strength training.",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    time: '14:30',
    isRead: true,
  },
  {
    id: 'tr3',
    trainerId: 't1',
    clientId: 'c1',
    title: 'Payment Received',
    message: "You've received a payment of $75.00 from Emma Wilson for the session on May 10, 2023.",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    time: '16:45',
    isRead: true,
    type: 'other',
  },
  {
    id: 'tr4',
    trainerId: 't1',
    clientId: 'c1',
    title: 'Training Tip: Client Motivation',
    message: "Research shows that clients who receive positive feedback during sessions are 30% more likely to stick with their fitness program. Try acknowledging small improvements in form or endurance.",
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    time: '08:30',
    isRead: false,
    type: 'tip',
  },
  {
    id: 'tr5',
    trainerId: 't1',
    clientId: 'c1',
    title: 'Business Growth Insight',
    message: "Trainers who post weekly transformation photos see 40% higher client engagement. Consider adding before/after photos to your profile (with client permission).",
    date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    time: '10:15',
    isRead: false,
    type: 'tip',
  },
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
    paymentMethod: 'credit_card'
  },
  // Tomorrow's session
  {
    id: 's2',
    trainerId: 't1',
    clientId: 'c2',
    date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    startTime: '10:00',
    endTime: '11:00',
    status: 'scheduled',
    type: 'virtual',
    notes: 'HIIT workout session',
    cost: 65,
    paymentStatus: 'pending',
    paymentMethod: 'paypal'
  },
  // Pending session
  {
    id: 's3',
    trainerId: 't1',
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
    paymentMethod: 'credit_card'
  },
  // Today's second session
  {
    id: 's4',
    trainerId: 't1',
    clientId: 'c3',
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
    paymentMethod: 'credit_card'
  },
  // Past session
  {
    id: 's5',
    trainerId: 't1',
    clientId: 'c2',
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
    paymentMethod: 'credit_card'
  },
  // Group session
  {
    id: 's6',
    trainerId: 't1',
    clientId: 'c3',
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
    paymentMethod: 'credit_card'
  },
  // House call session
  {
    id: 's7',
    trainerId: 't1',
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
    paymentMethod: 'credit_card'
  }
];

// Mock clients data
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
    sessionCount: 5,
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
    sessionCount: 3,
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
    sessionCount: 0,
    bio: 'Sophia is new to fitness training and is primarily focused on improving her posture and flexibility. She works as a graphic designer and spends long hours at her desk.'
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
    trainerId: 't1',
    clientId: 'c2',
    amount: 75,
    status: 'completed',
    method: 'credit_card',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    transactionId: 'txn_987654321'
  },
  {
    id: 'p3',
    sessionId: 's3',
    trainerId: 't1',
    clientId: 'c1',
    amount: 85,
    status: 'pending',
    method: 'paypal',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    transactionId: 'txn_567891234'
  }
];

// Mock payouts data
const mockPayouts: Payout[] = [
  {
    id: 'po1',
    trainerId: 't1',
    amount: 750.00,
    fee: 11.25, // 1.5% fee
    netAmount: 738.75,
    status: 'completed',
    method: {
      id: 'pm1',
      type: 'bank',
      name: 'Chase Bank',
      last4: '4567'
    },
    requestDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    processedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedArrivalDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'po2',
    trainerId: 't1',
    amount: 500.00,
    fee: 7.50, // 1.5% fee
    netAmount: 492.50,
    status: 'completed',
    method: {
      id: 'pm1',
      type: 'bank',
      name: 'Chase Bank',
      last4: '4567'
    },
    requestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    processedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedArrivalDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Mock revenue data
const mockRevenue: Revenue = {
  totalEarnings: 2450.75,
  availableBalance: 1875.50,
  pendingPayouts: 575.25,
  currentMonth: {
    earnings: 875.00,
    sessionsCompleted: 12,
    clientCount: 5,
    growth: 16.6, // percentage compared to last month
  },
  lastMonth: {
    earnings: 750.50,
    sessionsCompleted: 10,
    clientCount: 4,
    growth: 8.2,
  },
  revenueByType: [
    { type: 'one-on-one', amount: 1650.00, percentage: 67.3 },
    { type: 'group', amount: 450.75, percentage: 18.4 },
    { type: 'virtual', amount: 350.00, percentage: 14.3 },
  ],
  monthlyRevenue: [
    { month: 'Jan', amount: 450 },
    { month: 'Feb', amount: 520 },
    { month: 'Mar', amount: 610 },
    { month: 'Apr', amount: 750 },
    { month: 'May', amount: 875 },
  ]
};

// Function to generate random revenue data for a specific trainer
const generateRevenueData = (trainerId: string): Revenue => {
  // Random values for earnings
  const totalEarnings = Math.floor(1500 + Math.random() * 3000);
  const availableBalance = Math.floor(totalEarnings * 0.7);
  const pendingPayouts = Math.floor(totalEarnings * 0.3);
  
  // Current month stats
  const currentMonthEarnings = Math.floor(300 + Math.random() * 800);
  const lastMonthEarnings = Math.floor(250 + Math.random() * 700);
  const growth = parseFloat(((currentMonthEarnings / lastMonthEarnings - 1) * 100).toFixed(1));
  
  // Session types breakdown
  const oneOnOneAmount = Math.floor(totalEarnings * (0.6 + Math.random() * 0.2));
  const groupAmount = Math.floor(totalEarnings * (0.1 + Math.random() * 0.2));
  const virtualAmount = totalEarnings - oneOnOneAmount - groupAmount;
  
  // Calculate percentages
  const oneOnOnePercentage = parseFloat(((oneOnOneAmount / totalEarnings) * 100).toFixed(1));
  const groupPercentage = parseFloat(((groupAmount / totalEarnings) * 100).toFixed(1));
  const virtualPercentage = parseFloat(((virtualAmount / totalEarnings) * 100).toFixed(1));
  
  // Generate monthly revenue data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyRevenue = months.map(month => ({
    month,
    amount: Math.floor(200 + Math.random() * 800)
  }));
  
  return {
    totalEarnings,
    availableBalance,
    pendingPayouts,
    currentMonth: {
      earnings: currentMonthEarnings,
      sessionsCompleted: Math.floor(5 + Math.random() * 15),
      clientCount: Math.floor(2 + Math.random() * 8),
      growth
    },
    lastMonth: {
      earnings: lastMonthEarnings,
      sessionsCompleted: Math.floor(4 + Math.random() * 12),
      clientCount: Math.floor(2 + Math.random() * 6),
      growth: parseFloat((Math.random() * 15).toFixed(1))
    },
    revenueByType: [
      { type: 'one-on-one', amount: oneOnOneAmount, percentage: oneOnOnePercentage },
      { type: 'group', amount: groupAmount, percentage: groupPercentage },
      { type: 'virtual', amount: virtualAmount, percentage: virtualPercentage },
    ],
    monthlyRevenue
  };
};

// Function to generate random payment data for a specific trainer
const generatePaymentData = (trainerId: string, clientIds: string[]): Payment[] => {
  const payments: Payment[] = [];
  const paymentCount = Math.floor(3 + Math.random() * 8); // 3-10 payments
  
  for (let i = 0; i < paymentCount; i++) {
    const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
    const amount = Math.floor(50 + Math.random() * 100);
    const daysAgo = Math.floor(Math.random() * 30);
    const status = Math.random() > 0.2 ? 'completed' : 'pending';
    const method = Math.random() > 0.5 ? 'credit_card' : 'paypal';
    
    payments.push({
      id: `p${trainerId}_${i}`,
      trainerId,
      clientId,
      amount,
      status: status as 'completed' | 'pending' | 'failed' | 'refunded',
      method: method as 'credit_card' | 'paypal' | 'bank' | 'cash',
      date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`
    });
  }
  
  return payments;
};

// Function to generate training tips for trainers
const generateTrainingTips = (trainerId: string): Reminder[] => {
  const tips = [
    {
      title: "Client Retention Tip",
      message: "Clients who receive a follow-up message within 24 hours after their session are 40% more likely to book again. Try sending a quick note after each session."
    },
    {
      title: "Business Growth Strategy",
      message: "Offering a free fitness assessment to new clients can increase conversion rates by up to 60%. Consider adding this to your service offerings."
    },
    {
      title: "Training Effectiveness",
      message: "Research shows that clients achieve 30% better results when they track their workouts. Encourage your clients to use a fitness tracking app between sessions."
    },
    {
      title: "Client Motivation Tip",
      message: "Setting specific, measurable goals with clients increases their motivation by 70%. Try establishing clear 30, 60, and 90-day milestones with each client."
    },
    {
      title: "Nutrition Coaching",
      message: "Trainers who provide basic nutrition guidance see 45% better client results. Consider getting certified in nutrition coaching to expand your services."
    }
  ];
  
  return tips.map((tip, index) => ({
    id: `tip_${trainerId}_${index}`,
    trainerId,
    clientId: trainerId, // Self-tip
    title: tip.title,
    message: tip.message,
    date: new Date(Date.now() - (index + 1) * 86400000).toISOString(), // Staggered dates
    time: '08:00',
    isRead: false,
    type: 'tip'
  }));
};

export const useTrainerStore = create<TrainerState>()(
  persist(
    (set, get) => ({
      clients: mockClients,
      sessions: mockSessions,
      workoutPlans: [],
      mealPlans: [],
      reminders: [...mockReminders, ...generateTrainingTips('t1')],
      photos: mockPhotos,
      payments: mockPayments,
      payouts: mockPayouts,
      revenue: mockRevenue,
      isLoading: false,
      error: null,
      
      // Client management
      addClient: (client) => {
        console.log('Adding client to store:', client);
        set((state) => {
          // Check if client already exists to avoid duplicates
          const existingClientIndex = state.clients.findIndex(c => c.id === client.id);
          
          if (existingClientIndex >= 0) {
            // Update existing client
            const updatedClients = [...state.clients];
            updatedClients[existingClientIndex] = client;
            return { clients: updatedClients };
          } else {
            // Add new client
            return { clients: [...state.clients, client] };
          }
        });
      },
      
      updateClient: (client) => {
        console.log('Updating client in store:', client);
        set((state) => {
          // Find the client to update
          const existingClientIndex = state.clients.findIndex(c => c.id === client.id);
          
          if (existingClientIndex >= 0) {
            // Update existing client
            const updatedClients = [...state.clients];
            updatedClients[existingClientIndex] = client;
            return { clients: updatedClients };
          } else {
            // If client doesn't exist, add it
            console.log('Client not found, adding as new client');
            return { clients: [...state.clients, client] };
          }
        });
      },
      
      removeClient: (clientId) => {
        set(state => ({
          clients: state.clients.filter(client => client.id !== clientId)
        }));
      },
      
      // Session management
      scheduleSession: (sessionData) => {
        const newSession: Session = {
          ...sessionData,
          id: `s${Date.now()}`,
          status: sessionData.status || 'scheduled'
        };
        
        set(state => ({
          sessions: [...state.sessions, newSession]
        }));
        
        // Create notification for client if this is a new session
        if (newSession.status === 'scheduled') {
          const sessionDate = new Date(newSession.date);
          const formattedDate = sessionDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          });
          
          const sessionNotification: Omit<Reminder, 'id'> = {
            trainerId: newSession.trainerId,
            clientId: newSession.clientId,
            title: 'New Session Scheduled',
            message: `Your trainer has scheduled a ${newSession.type} session for ${formattedDate} at ${newSession.startTime}. Check your schedule for details.`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'session',
            relatedId: newSession.id
          };
          
          // Add notification
          get().createReminder(sessionNotification);
        }
        
        return newSession;
      },
      
      updateSession: (sessionId, updates) => {
        let updatedSession: Session | undefined;
        
        set(state => {
          const updatedSessions = state.sessions.map(session => {
            if (session.id === sessionId) {
              updatedSession = { ...session, ...updates };
              return updatedSession;
            }
            return session;
          });
          
          return { sessions: updatedSessions };
        });
        
        // Create notification for client if status changed
        if (updatedSession && updates.status && updates.status !== 'pending') {
          const sessionDate = new Date(updatedSession.date);
          const formattedDate = sessionDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          });
          
          let title = '';
          let message = '';
          let type: ReminderType = 'session_update';
          
          if (updates.status === 'scheduled') {
            title = 'Session Confirmed';
            message = `Your ${updatedSession.type} session on ${formattedDate} at ${updatedSession.startTime} has been confirmed.`;
            type = 'session_scheduled';
          } else if (updates.status === 'cancelled') {
            title = 'Session Cancelled';
            message = `Your ${updatedSession.type} session on ${formattedDate} at ${updatedSession.startTime} has been cancelled.`;
            type = 'session_cancelled';
          } else if (updates.status === 'completed') {
            title = 'Session Completed';
            message = `Your ${updatedSession.type} session on ${formattedDate} has been marked as completed.`;
          }
          
          if (title && message) {
            const sessionNotification: Omit<Reminder, 'id'> = {
              trainerId: updatedSession.trainerId,
              clientId: updatedSession.clientId,
              title,
              message,
              date: new Date().toISOString(),
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              isRead: false,
              type,
              relatedId: updatedSession.id
            };
            
            // Add notification
            get().createReminder(sessionNotification);
          }
        }
        
        return updatedSession;
      },
      
      cancelSession: (sessionId) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return;
        
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? { ...session, status: 'cancelled' } : session
          )
        }));
        
        // Create notification for client
        const sessionDate = new Date(session.date);
        const formattedDate = sessionDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
        
        const cancelNotification: Omit<Reminder, 'id'> = {
          trainerId: session.trainerId,
          clientId: session.clientId,
          title: 'Session Cancelled',
          message: `Your ${session.type} session on ${formattedDate} at ${session.startTime} has been cancelled by your trainer.`,
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'session_cancelled',
          relatedId: sessionId
        };
        
        // Add notification
        get().createReminder(cancelNotification);
      },
      
      acceptSession: (sessionId, isNewClient = false) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) {
          console.error(`Session with ID ${sessionId} not found`);
          Alert.alert('Error', `Session with ID ${sessionId} not found. Cannot accept the session.`);
          return;
        }
        
        console.log(`Accepting session ${sessionId}, isNewClient: ${isNewClient}`);
        
        // Update session status
        set(state => {
          const updatedSessions = state.sessions.map(s => 
            s.id === sessionId ? { 
              ...s, 
              status: 'scheduled' as 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'declined',
              isNewClient // Add flag for new client
            } : s
          );
          
          console.log(`Updated session status to scheduled. Total sessions: ${updatedSessions.length}`);
          
          // Debug: Log the updated session
          const updatedSession = updatedSessions.find(s => s.id === sessionId);
          console.log(`Updated session:`, {
            id: updatedSession?.id,
            status: updatedSession?.status,
            isNewClient: updatedSession?.isNewClient
          });
          
          return { sessions: updatedSessions };
        });
        
        // If this is a new client, update their session count
        if (isNewClient) {
          set(state => {
            const updatedClients = state.clients.map(client => {
              if (client.id === session.clientId) {
                const currentCount = client.sessionCount ?? 0;
                console.log(`Updating client ${client.id} session count from ${currentCount} to ${currentCount + 1}`);
                
                return {
                  ...client,
                  sessionCount: currentCount + 1
                };
              }
              return client;
            });
            
            return { clients: updatedClients };
          });
        }
        
        // Create notification for client
        const acceptanceNotification: Omit<Reminder, 'id'> = {
          trainerId: session.trainerId,
          clientId: session.clientId,
          title: 'Session Request Accepted',
          message: `Your session request for ${new Date(session.date).toLocaleDateString()} at ${session.startTime} has been accepted. We look forward to seeing you!`,
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'session_accepted',
          relatedId: sessionId
        };
        
        // Add notification
        get().createReminder(acceptanceNotification);
        
        // Debug: Alert to confirm the session was accepted and added to schedule
        Alert.alert(
          "Session Accepted",
          `Session ID ${sessionId} has been accepted and added to your schedule.${isNewClient ? ' This is a new client!' : ''}`,
          [{ text: "OK" }]
        );
      },
      
      declineSession: (sessionId, reason) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) {
          console.error(`Session with ID ${sessionId} not found`);
          Alert.alert('Error', `Session with ID ${sessionId} not found. Cannot decline the session.`);
          return;
        }
        
        // Update session status
        set(state => ({
          sessions: state.sessions.map(s => 
            s.id === sessionId ? { 
              ...s, 
              status: 'declined' as 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'declined', 
              declineReason: reason 
            } : s
          )
        }));
        
        // Create notification for client
        const declineNotification: Omit<Reminder, 'id'> = {
          trainerId: session.trainerId,
          clientId: session.clientId,
          title: 'Session Request Declined',
          message: `Your session request for ${new Date(session.date).toLocaleDateString()} at ${session.startTime} has been declined.${reason ? ` Reason: ${reason}` : ''}`,
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'session_declined',
          relatedId: sessionId
        };
        
        // Add notification
        get().createReminder(declineNotification);
      },
      
      // Workout plans
      createWorkoutPlan: (planData) => {
        const newPlan: WorkoutPlan = {
          ...planData,
          id: `wp${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          workoutPlans: [...state.workoutPlans, newPlan]
        }));
        
        // Create notification for client
        if (planData.clientId) {
          const planNotification: Omit<Reminder, 'id'> = {
            trainerId: planData.trainerId,
            clientId: planData.clientId,
            title: 'New Workout Plan',
            message: `Your trainer has created a new workout plan for you: ${planData.title}. Check it out in your workout plans.`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'workout_plan',
            relatedId: newPlan.id
          };
          
          // Add notification
          get().createReminder(planNotification);
        }
        
        return newPlan;
      },
      
      updateWorkoutPlan: (planId, updates) => {
        let updatedPlan: WorkoutPlan | undefined;
        
        set(state => {
          const updatedPlans = state.workoutPlans.map(plan => {
            if (plan.id === planId) {
              updatedPlan = { ...plan, ...updates };
              return updatedPlan;
            }
            return plan;
          });
          
          return { workoutPlans: updatedPlans };
        });
        
        // Create notification for client if significant updates
        if (updatedPlan && (updates.title || updates.description || updates.exercises)) {
          const planNotification: Omit<Reminder, 'id'> = {
            trainerId: updatedPlan.trainerId,
            clientId: updatedPlan.clientId,
            title: 'Workout Plan Updated',
            message: `Your trainer has updated your workout plan: ${updatedPlan.title}. Check it out in your workout plans.`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'workout_plan_update',
            relatedId: planId
          };
          
          // Add notification
          get().createReminder(planNotification);
        }
        
        return updatedPlan;
      },
      
      deleteWorkoutPlan: (planId) => {
        const plan = get().workoutPlans.find(p => p.id === planId);
        
        set(state => ({
          workoutPlans: state.workoutPlans.filter(plan => plan.id !== planId)
        }));
        
        // Create notification for client
        if (plan) {
          const planNotification: Omit<Reminder, 'id'> = {
            trainerId: plan.trainerId,
            clientId: plan.clientId,
            title: 'Workout Plan Removed',
            message: `Your trainer has removed the workout plan: ${plan.title}.`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'workout_plan_deleted',
            relatedId: planId
          };
          
          // Add notification
          get().createReminder(planNotification);
        }
      },
      
      // Meal plans
      createMealPlan: (planData) => {
        const newPlan: MealPlan = {
          ...planData,
          id: `mp${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          mealPlans: [...state.mealPlans, newPlan]
        }));
        
        // Create notification for client
        if (planData.clientId) {
          const planNotification: Omit<Reminder, 'id'> = {
            trainerId: planData.trainerId,
            clientId: planData.clientId,
            title: 'New Meal Plan',
            message: `Your trainer has created a new meal plan for you: ${planData.title}. Check it out in your meal plans.`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'meal_plan',
            relatedId: newPlan.id
          };
          
          // Add notification
          get().createReminder(planNotification);
        }
        
        return newPlan;
      },
      
      updateMealPlan: (planId, updates) => {
        let updatedPlan: MealPlan | undefined;
        
        set(state => {
          const updatedPlans = state.mealPlans.map(plan => {
            if (plan.id === planId) {
              updatedPlan = { ...plan, ...updates };
              return updatedPlan;
            }
            return plan;
          });
          
          return { mealPlans: updatedPlans };
        });
        
        // Create notification for client if significant updates
        if (updatedPlan && (updates.title || updates.description || updates.meals)) {
          const planNotification: Omit<Reminder, 'id'> = {
            trainerId: updatedPlan.trainerId,
            clientId: updatedPlan.clientId,
            title: 'Meal Plan Updated',
            message: `Your trainer has updated your meal plan: ${updatedPlan.title}. Check it out in your meal plans.`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'meal_plan_update',
            relatedId: planId
          };
          
          // Add notification
          get().createReminder(planNotification);
        }
        
        return updatedPlan;
      },
      
      deleteMealPlan: (planId) => {
        const plan = get().mealPlans.find(p => p.id === planId);
        
        set(state => ({
          mealPlans: state.mealPlans.filter(plan => plan.id !== planId)
        }));
        
        // Create notification for client
        if (plan) {
          const planNotification: Omit<Reminder, 'id'> = {
            trainerId: plan.trainerId,
            clientId: plan.clientId,
            title: 'Meal Plan Removed',
            message: `Your trainer has removed the meal plan: ${plan.title}.`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'meal_plan_deleted',
            relatedId: planId
          };
          
          // Add notification
          get().createReminder(planNotification);
        }
      },
      
      // Reminders
      createReminder: (reminderData) => {
        const newReminder: Reminder = {
          ...reminderData,
          id: `r${Date.now()}`,
        };
        
        // IMPORTANT: This is the key fix - we need to update the state immediately
        // and ensure the reminder is added to the store
        set(state => {
          // Log for debugging
          console.log('Creating reminder in trainer store:', newReminder);
          console.log('Current reminders count:', state.reminders.length);
          
          // Create a new array with the new reminder
          const updatedReminders = [...state.reminders, newReminder];
          
          // Log the updated count
          console.log('New reminders count:', updatedReminders.length);
          
          // Show debug alert
          if (newReminder.type === 'session_request') {
            Alert.alert(
              "Debug: New Session Request",
              `Trainer received a new session request notification.

ID: ${newReminder.id}
Type: ${newReminder.type}`,
              [{ text: "OK" }]
            );
          }
          
          return { reminders: updatedReminders };
        });
        
        return newReminder;
      },
      
      updateReminder: (reminderId, updates) => {
        set(state => ({
          reminders: state.reminders.map(reminder => 
            reminder.id === reminderId ? { ...reminder, ...updates } : reminder
          )
        }));
      },
      
      deleteReminder: (reminderId) => {
        set(state => ({
          reminders: state.reminders.filter(reminder => reminder.id !== reminderId)
        }));
      },
      
      markReminderAsRead: (reminderId) => {
        set(state => ({
          reminders: state.reminders.map(reminder => 
            reminder.id === reminderId ? { ...reminder, isRead: true } : reminder
          )
        }));
      },
      
      // Photos
      addPhoto: (photoData) => {
        const newPhoto: Photo = {
          ...photoData,
          id: `p${Date.now()}`,
          createdAt: new Date().toISOString(),
          likes: 0
        };
        
        set(state => ({
          photos: [...state.photos, newPhoto]
        }));
        
        return newPhoto;
      },
      
      updatePhoto: (photoId, updates) => {
        set(state => ({
          photos: state.photos.map(photo => 
            photo.id === photoId ? { ...photo, ...updates } : photo
          )
        }));
      },
      
      deletePhoto: (photoId) => {
        set(state => ({
          photos: state.photos.filter(photo => photo.id !== photoId)
        }));
      },
      
      likePhoto: (photoId) => {
        set(state => ({
          photos: state.photos.map(photo => 
            photo.id === photoId ? { ...photo, likes: photo.likes + 1 } : photo
          )
        }));
      },
      
      // Payments
      recordPayment: (paymentData) => {
        const newPayment: Payment = {
          ...paymentData,
          id: `p${Date.now()}`,
          date: new Date().toISOString()
        };
        
        set(state => ({
          payments: [...state.payments, newPayment]
        }));
        
        // Update session payment status if this is for a session
        if (paymentData.sessionId) {
          set(state => ({
            sessions: state.sessions.map(session => 
              session.id === paymentData.sessionId 
                ? { ...session, paymentStatus: paymentData.status === 'completed' ? 'paid' : paymentData.status as any } 
                : session
            )
          }));
          
          // Create notification for client
          const session = get().sessions.find(s => s.id === paymentData.sessionId);
          if (session) {
            const paymentNotification: Omit<Reminder, 'id'> = {
              trainerId: paymentData.trainerId,
              clientId: paymentData.clientId,
              title: 'Payment Recorded',
              message: `A payment of $${paymentData.amount.toFixed(2)} has been recorded for your session on ${new Date(session.date).toLocaleDateString()}.`,
              date: new Date().toISOString(),
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              isRead: false,
              type: 'payment',
              relatedId: paymentData.sessionId
            };
            
            // Add notification
            get().createReminder(paymentNotification);
          }
        }
        
        return newPayment;
      },
      
      updatePaymentStatus: (paymentId, status) => {
        set(state => {
          // Find the payment
          const payment = state.payments.find(p => p.id === paymentId);
          if (!payment) return state;
          
          // Update payment status
          const updatedPayments = state.payments.map(p => 
            p.id === paymentId ? { ...p, status } : p
          );
          
          // Also update session payment status if this is for a session
          const updatedSessions = payment.sessionId 
            ? state.sessions.map(session => 
                session.id === payment.sessionId 
                  ? { ...session, paymentStatus: status === 'completed' ? 'paid' : status as any } 
                  : session
              )
            : state.sessions;
          
          return {
            payments: updatedPayments,
            sessions: updatedSessions
          };
        });
        
        // Create notification for client
        const payment = get().payments.find(p => p.id === paymentId);
        if (payment) {
          const statusText = status === 'completed' ? 'confirmed' : 
                            status === 'failed' ? 'failed' : 
                            status === 'refunded' ? 'refunded' : 'updated';
          
          const paymentNotification: Omit<Reminder, 'id'> = {
            trainerId: payment.trainerId,
            clientId: payment.clientId,
            title: `Payment ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
            message: `Your payment of $${payment.amount.toFixed(2)} has been ${statusText}.`,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'payment_update',
            relatedId: payment.sessionId || payment.id
          };
          
          // Add notification
          get().createReminder(paymentNotification);
        }
      },
      
      fetchPayments: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, we would fetch from an API
          // For demo, we'll just return mock payments
          set({ payments: mockPayments, isLoading: false });
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch payments", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      // Payouts
      requestPayout: async (amount: number, paymentMethodId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Calculate fee (1.5%)
          const fee = amount * 0.015;
          const netAmount = amount - fee;
          
          // Get payment method
          const paymentMethod = mockPaymentMethods.find(m => m.id === paymentMethodId);
          if (!paymentMethod) {
            throw new Error("Payment method not found");
          }
          
          // Create new payout
          const newPayout: Payout = {
            id: `po${Date.now()}`,
            trainerId: 't1', // Hardcoded for demo
            amount,
            fee,
            netAmount,
            status: 'processing',
            method: {
              id: paymentMethod.id,
              type: paymentMethod.type,
              name: paymentMethod.name,
              last4: paymentMethod.last4
            },
            requestDate: new Date().toISOString(),
            estimatedArrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          };
          
          // Update payouts
          set(state => ({
            payouts: [...state.payouts, newPayout],
            isLoading: false
          }));
          
          // Update available balance
          set(state => ({
            revenue: {
              ...state.revenue,
              availableBalance: state.revenue.availableBalance - amount,
              pendingPayouts: state.revenue.pendingPayouts + amount
            }
          }));
          
          return newPayout;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to request payout", 
            isLoading: false 
          });
          throw error;
        }
      },
      
      fetchPayouts: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // In a real app, we would fetch from an API
          // For demo, we'll just return mock payouts
          set({ payouts: mockPayouts, isLoading: false });
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch payouts", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      // Revenue
      fetchRevenue: async (period = 'all') => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Get current user ID
          const userId = get().revenue.trainerId || 't1';
          
          // In a real app, we would fetch from an API with the specified period
          // For demo, we'll use the stored revenue data for this user
          const userRevenue = get().revenue;
          
          // Apply period filter (simplified for demo)
          let filteredRevenue = { ...userRevenue };
          
          if (period === 'day') {
            // Adjust for daily view (simplified)
            filteredRevenue.totalEarnings = Math.floor(userRevenue.totalEarnings / 30);
            filteredRevenue.availableBalance = Math.floor(userRevenue.availableBalance / 30);
            filteredRevenue.pendingPayouts = Math.floor(userRevenue.pendingPayouts / 30);
          } else if (period === 'week') {
            // Adjust for weekly view (simplified)
            filteredRevenue.totalEarnings = Math.floor(userRevenue.totalEarnings / 4);
            filteredRevenue.availableBalance = Math.floor(userRevenue.availableBalance / 4);
            filteredRevenue.pendingPayouts = Math.floor(userRevenue.pendingPayouts / 4);
          } else if (period === 'month') {
            // Use current month data
            filteredRevenue.totalEarnings = userRevenue.currentMonth.earnings;
          }
          
          set({ revenue: filteredRevenue, isLoading: false });
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to fetch revenue data", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      // Generate revenue data for a specific user
      generateRevenueForUser: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Generate random revenue data for this user
          const userRevenue = generateRevenueData(userId);
          
          // Add trainer ID to revenue data
          const revenueWithTrainerId = {
            ...userRevenue,
            trainerId: userId
          };
          
          // Generate random payment data
          const clientIds = get().clients.map(client => client.id);
          const userPayments = generatePaymentData(userId, clientIds);
          
          // Update store with new data
          set({
            revenue: revenueWithTrainerId,
            payments: userPayments,
            isLoading: false
          });
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "Failed to generate revenue data", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      }
    }),
    {
      name: 'trainer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);