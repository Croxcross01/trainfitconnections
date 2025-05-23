import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '@/types';
import { Alert } from 'react-native';
import { trpcClient } from '@/lib/trpc';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  experience?: string;
  rating?: number;
  reviewCount?: number;
  hourlyRate?: number;
  rateType?: 'hourly' | 'custom';
  customRates?: {
    id: string;
    title: string;
    amount: number;
  }[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  availability?: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registeredUsers: User[]; // Store registered users
  userPasswords: Record<string, string>; // Store passwords (for demo only)
  resetTokens: Record<string, { token: string, expiry: number }>; // Store reset tokens
  
  // Actions
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  getTrainers: () => User[];
  getAllUsers: () => User[];
  debugUsers: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyResetToken: (email: string, token: string) => Promise<boolean>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      registeredUsers: [],
      userPasswords: {}, // Store passwords in the persisted state
      resetTokens: {},
      
      clearError: () => {
        set({ error: null });
      },
      
      login: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Convert email to lowercase for case-insensitive comparison
          const lowerEmail = email.toLowerCase();
          
          // Find user by email in registered users
          const user = get().registeredUsers.find(u => 
            u.email.toLowerCase() === lowerEmail && u.role === role
          );
          
          console.log("Login attempt:", { email: lowerEmail, role, userFound: !!user });
          console.log("All registered users:", get().registeredUsers.map(u => ({ email: u.email, role: u.role })));
          
          // Get stored password
          const storedPassword = get().userPasswords[lowerEmail];
          console.log("Stored password exists:", !!storedPassword);
          
          // Check if user exists and password matches
          if (user && storedPassword === password) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            console.log("Login successful for:", user.email);
            return;
          } else {
            console.log("Login failed. User exists:", !!user, "Password match:", user ? storedPassword === password : false);
            
            // If user exists but password doesn't match
            if (user && storedPassword !== password) {
              throw new Error("Incorrect password. Please try again or use 'Forgot Password'");
            }
            
            // If user doesn't exist with this role
            if (!user) {
              // Check if user exists with a different role
              const userWithDifferentRole = get().registeredUsers.find(u => 
                u.email.toLowerCase() === lowerEmail && u.role !== role
              );
              
              if (userWithDifferentRole) {
                throw new Error(`This email is registered as a ${userWithDifferentRole.role}, not a ${role}`);
              } else {
                throw new Error("Email not found. Please register first.");
              }
            }
            
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          console.log("Login error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Login failed", 
            isLoading: false,
            isAuthenticated: false
          });
        }
      },
      
      register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if email already exists with the same role
          const lowerEmail = email.toLowerCase();
          const existingUser = get().registeredUsers.find(u => 
            u.email.toLowerCase() === lowerEmail && u.role === role
          );
          
          if (existingUser) {
            throw new Error(`Email already registered as a ${role}`);
          }
          
          // Create new user
          const userId = role === 'trainer' ? 't' + Math.random().toString(36).substring(2, 9) : 'c' + Math.random().toString(36).substring(2, 9);
          
          const newUser: User = {
            id: userId,
            email,
            name,
            role,
            location: {
              latitude: 30.2672,
              longitude: -97.7431,
              address: "Austin, TX"
            },
            isVerified: false,
            // Add default values based on role
            ...(role === 'trainer' ? {
              bio: "I'm a fitness professional helping clients achieve their goals.",
              specialties: ["General Fitness"],
              experience: "New Trainer",
              hourlyRate: 50,
              rateType: 'hourly',
              rating: 0,
              reviewCount: 0,
              availability: {
                days: ["Monday", "Wednesday", "Friday"],
                hours: {
                  start: "09:00",
                  end: "17:00"
                }
              }
            } : {
              bio: "I'm looking to improve my fitness and health."
            })
          };
          
          // Store password in the persisted state
          const updatedPasswords = {
            ...get().userPasswords,
            [lowerEmail]: password
          };
          
          // Add user to registered users
          const updatedUsers = [...get().registeredUsers, newUser];
          
          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            registeredUsers: updatedUsers,
            userPasswords: updatedPasswords
          });
          
          // If registering as a trainer, also register in backend
          if (role === 'trainer') {
            try {
              await trpcClient.trainers.registerTrainer.mutate({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                profileImage: newUser.profileImage || '',
                bio: newUser.bio || '',
                specialties: newUser.specialties || [],
                certifications: newUser.certifications || [],
                location: newUser.location,
                hourlyRate: newUser.hourlyRate || 50,
              });
            } catch (err) {
              console.error('Failed to register trainer in backend:', err);
              // Optionally set error, but allow local registration to succeed
            }
          }
          
          console.log("Registration successful. User added:", newUser.email);
          console.log("Total registered users:", updatedUsers.length);
          console.log("Passwords stored:", Object.keys(updatedPasswords).length);
          
          // Debug: Log all registered users
          console.log("All registered users after registration:", 
            updatedUsers.map(u => ({ id: u.id, email: u.email, role: u.role }))
          );
          
          return;
        } catch (error) {
          console.log("Registration error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Registration failed", 
            isLoading: false,
            isAuthenticated: false
          });
        }
      },
      
      logout: () => {
        // Clear all auth state
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false
        });
        console.log("Logout successful");
      },
      
      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const currentUser = get().user;
          if (!currentUser) {
            throw new Error("No user logged in");
          }
          
          // Update user data
          const updatedUser = { ...currentUser, ...userData };
          
          // Update user in registered users list
          const updatedUsers = get().registeredUsers.map(user => 
            user.id === currentUser.id ? updatedUser : user
          );
          
          set({
            user: updatedUser,
            registeredUsers: updatedUsers,
            isLoading: false,
            error: null
          });
          
          console.log("Profile updated successfully for:", updatedUser.email);
        } catch (error) {
          console.log("Profile update error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Profile update failed", 
            isLoading: false 
          });
        }
      },

      // Function to get all trainers
      getTrainers: () => {
        // Return all users with role 'trainer'
        const trainers = get().registeredUsers.filter(user => user.role === 'trainer');
        console.log(`Found ${trainers.length} registered trainers`);
        return trainers;
      },
      
      // Function to get all users (for debugging)
      getAllUsers: () => {
        return get().registeredUsers;
      },
      
      // Debug function to show all users
      debugUsers: () => {
        const users = get().registeredUsers;
        const passwords = get().userPasswords;
        console.log("All registered users:", users.map(u => ({ id: u.id, email: u.email, role: u.role })));
        console.log("Stored passwords:", Object.keys(passwords).length);
        
        // Show alert with user count
        Alert.alert(
          "Debug Info",
          `Total registered users: ${users.length}
Trainers: ${users.filter(u => u.role === 'trainer').length}
Clients: ${users.filter(u => u.role === 'client').length}
Passwords stored: ${Object.keys(passwords).length}
Emails with passwords: ${Object.keys(passwords).join(', ')}`,
          [{ text: "OK" }]
        );
      },
      
      // Request password reset
      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const lowerEmail = email.toLowerCase();
          
          // Check if email exists
          const user = get().registeredUsers.find(u => u.email.toLowerCase() === lowerEmail);
          
          if (!user) {
            throw new Error("Email not found. Please check your email address.");
          }
          
          // Generate a 6-digit token
          const token = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Set expiry to 15 minutes from now
          const expiry = Date.now() + 15 * 60 * 1000;
          
          // Store token
          const updatedTokens = {
            ...get().resetTokens,
            [lowerEmail]: { token, expiry }
          };
          
          set({
            resetTokens: updatedTokens,
            isLoading: false,
            error: null
          });
          
          console.log("Password reset requested for:", lowerEmail);
          console.log("Reset token:", token);
          
          // In a real app, you would send an email here
          // For demo purposes, show the token in an alert
          Alert.alert(
            "Password Reset Token",
            `Your password reset token is: ${token}

In a real app, this would be sent to your email.`,
            [{ text: "OK" }]
          );
          
          return;
        } catch (error) {
          console.log("Password reset request error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Password reset request failed", 
            isLoading: false 
          });
        }
      },
      
      // Verify reset token
      verifyResetToken: async (email, token) => {
        const lowerEmail = email.toLowerCase();
        const resetData = get().resetTokens[lowerEmail];
        
        if (!resetData) {
          return false;
        }
        
        // Check if token matches and is not expired
        if (resetData.token === token && resetData.expiry > Date.now()) {
          return true;
        }
        
        return false;
      },
      
      // Reset password
      resetPassword: async (email, token, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const lowerEmail = email.toLowerCase();
          
          // Verify token
          const isValid = await get().verifyResetToken(lowerEmail, token);
          
          if (!isValid) {
            throw new Error("Invalid or expired token. Please request a new password reset.");
          }
          
          // Update password
          const updatedPasswords = {
            ...get().userPasswords,
            [lowerEmail]: newPassword
          };
          
          // Clear reset token
          const { [lowerEmail]: _, ...updatedTokens } = get().resetTokens;
          
          set({
            userPasswords: updatedPasswords,
            resetTokens: updatedTokens,
            isLoading: false,
            error: null
          });
          
          console.log("Password reset successful for:", lowerEmail);
          
          // Show success message
          Alert.alert(
            "Password Reset Successful",
            "Your password has been reset. You can now log in with your new password.",
            [{ text: "OK" }]
          );
          
          return;
        } catch (error) {
          console.log("Password reset error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Password reset failed", 
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers,
        userPasswords: state.userPasswords,
        resetTokens: state.resetTokens
      }),
    }
  )
);