import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { useTrainerStore } from '@/store/trainer-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import {
  Settings,
  LogOut,
  MessageCircle,
  Calendar,
  Users,
  ClockIcon,
  FileText,
  Camera,
  Video,
  DollarSign,
  HelpCircle,
  ChevronRight,
  Star,
  Dumbbell,
  Utensils,
  Bell,
  Heart,
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Globe,
  Edit,
  Shield,
  CreditCard,
  User,
} from 'lucide-react-native';
import { Client } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { generateRevenueForUser } = useTrainerStore();
  
  // Generate revenue data for the current user if they are a trainer
  useEffect(() => {
    if (user?.role === 'trainer' && user?.id) {
      generateRevenueForUser(user.id);
    }
  }, [user?.id, user?.role, generateRevenueForUser]);
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            logout();
            router.replace('/(auth)');
          }
        }
      ]
    );
  };
  
  if (!user) {
    return (
      <SafeAreaView style={layout.screen}>
        <View style={styles.container}>
          <Text style={styles.title}>Not logged in</Text>
          <Button 
            title="Go to Login" 
            onPress={() => router.replace('/(auth)')}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const isTrainer = user.role === 'trainer';
  const isClient = user.role === 'client';
  
  // Cast user to Client type if they are a client
  const clientUser = isClient ? (user as Client) : null;
  
  // Safely check for existence of properties
  const hasGoals = clientUser?.goals && clientUser?.goals?.length > 0;
  const hasHealthInfo = clientUser?.healthInfo !== undefined;
  const hasMedicalConditions = hasHealthInfo && 
    clientUser?.healthInfo?.medicalConditions && 
    clientUser?.healthInfo?.medicalConditions?.length > 0;
  
  return (
    <SafeAreaView style={layout.screen} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: user.profileImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1000' }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => router.push('/edit-profile')}
            >
              <Edit size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{user.name}</Text>
              {user.isVerified && <VerifiedBadge size={18} style={styles.verifiedBadge} />}
            </View>
            
            <Text style={styles.role}>{isTrainer ? 'Fitness Trainer' : 'Client'}</Text>
            
            {isTrainer && user.rating !== undefined && (
              <View style={styles.ratingContainer}>
                <Star size={16} color={Colors.accent.yellow} fill={Colors.accent.yellow} />
                <Text style={styles.rating}>{user.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({user.reviewCount || 0} reviews)</Text>
              </View>
            )}
            
            {user.location && (
              <View style={styles.locationContainer}>
                <MapPin size={14} color={Colors.text.secondary} />
                <Text style={styles.location}>{user.location.address}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Bio Section */}
        {user.bio && (
          <Card style={styles.bioCard}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </Card>
        )}
        
        {/* Trainer Specific Sections */}
        {isTrainer && (
          <>
            {/* Specialties */}
            {user.specialties && user.specialties.length > 0 && (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Specialties</Text>
                <View style={styles.tagsContainer}>
                  {user.specialties.map((specialty, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}
            
            {/* Certifications */}
            {user.certifications && user.certifications.length > 0 && (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                <View style={styles.listContainer}>
                  {user.certifications.map((cert, index) => (
                    <View key={index} style={styles.listItem}>
                      <Shield size={16} color={Colors.primary} />
                      <Text style={styles.listItemText}>{cert}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}
            
            {/* Rates */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Rates</Text>
              {user.rateType === 'hourly' ? (
                <View style={styles.rateItem}>
                  <ClockIcon size={16} color={Colors.primary} />
                  <Text style={styles.rateText}>
                    ${user.hourlyRate}/hour
                  </Text>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {user.customRates && user.customRates.map((rate, index) => (
                    <View key={index} style={styles.rateItem}>
                      <DollarSign size={16} color={Colors.primary} />
                      <Text style={styles.rateText}>
                        {rate.title}: ${rate.amount}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </>
        )}
        
        {/* Client Specific Sections */}
        {isClient && (
          <>
            {/* Goals */}
            {hasGoals && (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Fitness Goals</Text>
                <View style={styles.tagsContainer}>
                  {clientUser?.goals?.map((goal: string, index: number) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{goal}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}
            
            {/* Health Info */}
            {hasHealthInfo && (
              <Card style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Health Information</Text>
                <View style={styles.healthInfoContainer}>
                  {clientUser?.healthInfo?.height && (
                    <View style={styles.healthInfoItem}>
                      <Text style={styles.healthInfoLabel}>Height</Text>
                      <Text style={styles.healthInfoValue}>{clientUser.healthInfo.height} cm</Text>
                    </View>
                  )}
                  
                  {clientUser?.healthInfo?.weight && (
                    <View style={styles.healthInfoItem}>
                      <Text style={styles.healthInfoLabel}>Weight</Text>
                      <Text style={styles.healthInfoValue}>{clientUser.healthInfo.weight} kg</Text>
                    </View>
                  )}
                </View>
                
                {hasMedicalConditions && (
                  <View style={styles.medicalContainer}>
                    <Text style={styles.medicalLabel}>Medical Conditions:</Text>
                    <Text style={styles.medicalValue}>
                      {clientUser?.healthInfo?.medicalConditions?.join(', ')}
                    </Text>
                  </View>
                )}
              </Card>
            )}
          </>
        )}
        
        {/* Social Links */}
        {user.socialLinks && Object.values(user.socialLinks).some(link => !!link) && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            <View style={styles.socialLinksContainer}>
              {user.socialLinks.instagram && (
                <TouchableOpacity style={styles.socialButton}>
                  <Instagram size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              )}
              
              {user.socialLinks.twitter && (
                <TouchableOpacity style={styles.socialButton}>
                  <Twitter size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              )}
              
              {user.socialLinks.facebook && (
                <TouchableOpacity style={styles.socialButton}>
                  <Facebook size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              )}
              
              {user.socialLinks.linkedin && (
                <TouchableOpacity style={styles.socialButton}>
                  <Linkedin size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              )}
              
              {user.socialLinks.website && (
                <TouchableOpacity style={styles.socialButton}>
                  <Globe size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
        
        {/* Navigation Menu */}
        <View style={styles.menuContainer}>
          {/* Schedule Section */}
          <Text style={styles.menuSectionTitle}>Schedule</Text>
          
          <Card style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/schedule')}
            >
              <View style={styles.menuIconContainer}>
                <Calendar size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>My Schedule</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            {isTrainer && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/(tabs)/clients')}
              >
                <View style={styles.menuIconContainer}>
                  <Users size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>My Clients</Text>
                <ChevronRight size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            )}
            
            {!isTrainer && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/(tabs)/my-trainers')}
              >
                <View style={styles.menuIconContainer}>
                  <Dumbbell size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>My Trainers</Text>
                <ChevronRight size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/notifications')}
            >
              <View style={styles.menuIconContainer}>
                <Bell size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Notifications</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </Card>
          
          {/* Plans Section */}
          <Text style={styles.menuSectionTitle}>Plans</Text>
          
          <Card style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/workout-plans')}
            >
              <View style={styles.menuIconContainer}>
                <Dumbbell size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Workout Plans</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/meal-plans')}
            >
              <View style={styles.menuIconContainer}>
                <Utensils size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Meal Plans</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </Card>
          
          {/* Content Section */}
          {isTrainer && (
            <>
              <Text style={styles.menuSectionTitle}>Content</Text>
              
              <Card style={styles.menuCard}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => router.push('/trainer/photos')}
                >
                  <View style={styles.menuIconContainer}>
                    <Camera size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.menuItemText}>Photos</Text>
                  <ChevronRight size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => router.push('/trainer/videos')}
                >
                  <View style={styles.menuIconContainer}>
                    <Video size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.menuItemText}>Videos</Text>
                  <ChevronRight size={20} color={Colors.text.secondary} />
                </TouchableOpacity>
              </Card>
            </>
          )}
          
          {/* Account Section */}
          <Text style={styles.menuSectionTitle}>Account</Text>
          
          <Card style={styles.menuCard}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
            >
              <View style={styles.menuIconContainer}>
                <User size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Edit Profile</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            {isTrainer && (
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => router.push('/revenue')}
              >
                <View style={styles.menuIconContainer}>
                  <DollarSign size={20} color={Colors.primary} />
                </View>
                <Text style={styles.menuItemText}>Revenue</Text>
                <ChevronRight size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/billing-history')}
            >
              <View style={styles.menuIconContainer}>
                <CreditCard size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Billing History</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings')}
            >
              <View style={styles.menuIconContainer}>
                <Settings size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Settings</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/help-support')}
            >
              <View style={styles.menuIconContainer}>
                <HelpCircle size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Help & Support</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <View style={styles.menuIconContainer}>
                <LogOut size={20} color={Colors.status.error} />
              </View>
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
              <ChevronRight size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    ...typography.h4,
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.h5,
    marginRight: 8,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  role: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 4,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  bioCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  bioText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    ...typography.h6,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tag: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  listContainer: {
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listItemText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
  },
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rateText: {
    fontSize: 14,
    color: Colors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
  healthInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  healthInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  healthInfoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  healthInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  medicalContainer: {
    marginTop: 8,
  },
  medicalLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  medicalValue: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  logoutText: {
    color: Colors.status.error,
  },
});