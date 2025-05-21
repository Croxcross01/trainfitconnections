import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, MapPin, Award, Calendar, MessageSquare, Heart, Instagram, Twitter, Facebook, Linkedin, Globe, DollarSign } from 'lucide-react-native';
import { useClientStore } from '@/store/client-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { Trainer } from '@/types';
import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function TrainerProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { nearbyTrainers, favoriteTrainers, toggleFavoriteTrainer } = useClientStore();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Use tRPC mutation for sending messages
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: (data) => {
      console.log('Initial message sent successfully:', data);
      // Navigate to the chat screen
      router.push({
        pathname: '/messages/chat',
        params: { 
          threadId: data.threadId,
          recipientId: trainer?.id,
          recipientName: trainer?.name,
          recipientImage: trainer?.profileImage || ''
        }
      });
    },
    onError: (error) => {
      console.error('Failed to initiate conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    }
  });
  
  useEffect(() => {
    // Find trainer by ID
    const foundTrainer = nearbyTrainers.find(t => t.id === id);
    if (foundTrainer) {
      setTrainer(foundTrainer);
    }
    
    // Check if trainer is in favorites
    if (favoriteTrainers.includes(id as string)) {
      setIsFavorite(true);
    }
  }, [id, nearbyTrainers, favoriteTrainers]);
  
  if (!trainer) {
    return null;
  }
  
  const handleToggleFavorite = () => {
    toggleFavoriteTrainer(trainer.id);
    setIsFavorite(!isFavorite);
  };
  
  const handleBookSession = () => {
    router.push({
      pathname: '/book-session',
      params: { trainerId: trainer.id }
    });
  };
  
  const handleMessageTrainer = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }
    
    // First check if there's an existing conversation
    router.push({
      pathname: '/messages/chat',
      params: { 
        recipientId: trainer.id,
        recipientName: trainer.name,
        recipientImage: trainer.profileImage || ''
      }
    });
  };
  
  const handleOpenSocialLink = (url: string | undefined, platform: string) => {
    if (!url) {
      Alert.alert('No Link', `This trainer hasn't added their ${platform} profile yet.`);
      return;
    }
    
    // Add https:// if not present
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = `https://${url}`;
    }
    
    Linking.canOpenURL(fullUrl).then(supported => {
      if (supported) {
        Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', `Cannot open ${platform} link: ${url}`);
      }
    });
  };
  
  const renderRateInfo = () => {
    if (trainer.rateType === "custom" && trainer.customRates && trainer.customRates.length > 0) {
      return (
        <View style={styles.customRatesContainer}>
          <Text style={styles.customRatesTitle}>Rate Options:</Text>
          {trainer.customRates.map((rate, index) => (
            <View key={index} style={styles.customRateItem}>
              <Text style={styles.customRateTitle}>{rate.title}</Text>
              <Text style={styles.customRateAmount}>${rate.amount}</Text>
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>${trainer.hourlyRate}/hr</Text>
        </View>
      );
    }
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen 
        options={{
          title: trainer.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
              <Heart 
                size={24} 
                color={isFavorite ? Colors.status.error : Colors.text.tertiary} 
                fill={isFavorite ? Colors.status.error : 'none'} 
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.header}>
        <Image 
          source={{ uri: trainer.profileImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000' }} 
          style={styles.profileImage} 
        />
        
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{trainer.name}</Text>
            <VerifiedBadge />
          </View>
          
          <View style={styles.ratingContainer}>
            <Star size={16} color={Colors.status.warning} fill={Colors.status.warning} />
            <Text style={styles.rating}>{trainer.rating} ({trainer.reviewCount} reviews)</Text>
          </View>
          
          {trainer.location && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.text.secondary} />
              <Text style={styles.location}>{trainer.location.address}</Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Social Media Links */}
      {trainer.socialLinks && Object.values(trainer.socialLinks).some(link => link) && (
        <View style={styles.socialLinksContainer}>
          {trainer.socialLinks.instagram && (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocialLink(trainer.socialLinks?.instagram, 'Instagram')}
            >
              <Instagram size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
          
          {trainer.socialLinks.twitter && (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocialLink(trainer.socialLinks?.twitter, 'Twitter')}
            >
              <Twitter size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
          
          {trainer.socialLinks.facebook && (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocialLink(trainer.socialLinks?.facebook, 'Facebook')}
            >
              <Facebook size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
          
          {trainer.socialLinks.linkedin && (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocialLink(trainer.socialLinks?.linkedin, 'LinkedIn')}
            >
              <Linkedin size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
          
          {trainer.socialLinks.website && (
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleOpenSocialLink(trainer.socialLinks?.website, 'Website')}
            >
              <Globe size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{trainer.bio}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Experience</Text>
            <Text style={styles.detailValue}>{trainer.experience} years</Text>
          </View>
          
          {renderRateInfo()}
        </View>
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.specialtiesContainer}>
          {trainer.specialties?.map((specialty, index) => (
            <View key={index} style={styles.specialtyBadge}>
              <Award size={16} color={Colors.primary} style={styles.specialtyIcon} />
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.certificationsContainer}>
          {trainer.certifications?.map((certification, index) => (
            <Text key={index} style={styles.certification}>
              • {typeof certification === 'string' 
                  ? certification 
                  : certification.name}
            </Text>
          ))}
        </View>
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.pricingContainer}>
          {trainer.pricing && (
            <>
              <View style={styles.pricingItem}>
                <View style={styles.pricingIconContainer}>
                  <DollarSign size={20} color={Colors.primary} />
                </View>
                <View style={styles.pricingDetails}>
                  <Text style={styles.pricingType}>One-on-One</Text>
                  <Text style={styles.pricingValue}>${trainer.pricing.oneOnOne}/session</Text>
                </View>
              </View>
              
              <View style={styles.pricingItem}>
                <View style={styles.pricingIconContainer}>
                  <DollarSign size={20} color={Colors.primary} />
                </View>
                <View style={styles.pricingDetails}>
                  <Text style={styles.pricingType}>Group Sessions</Text>
                  <Text style={styles.pricingValue}>${trainer.pricing.group}/person</Text>
                </View>
              </View>
              
              <View style={styles.pricingItem}>
                <View style={styles.pricingIconContainer}>
                  <DollarSign size={20} color={Colors.primary} />
                </View>
                <View style={styles.pricingDetails}>
                  <Text style={styles.pricingType}>Virtual Sessions</Text>
                  <Text style={styles.pricingValue}>${trainer.pricing.virtual}/session</Text>
                </View>
              </View>
            </>
          )}
          
          {trainer.customRates && trainer.customRates.length > 0 && (
            <>
              <Text style={styles.packageTitle}>Special Packages</Text>
              {trainer.customRates.map((rate, index) => (
                <View key={index} style={styles.packageItem}>
                  <View style={styles.packageHeader}>
                    <Text style={styles.packageName}>{rate.title}</Text>
                    <Text style={styles.packagePrice}>${rate.amount}</Text>
                  </View>
                  {rate.description && (
                    <Text style={styles.packageDescription}>{rate.description}</Text>
                  )}
                </View>
              ))}
            </>
          )}
        </View>
      </Card>
      
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        {trainer.availability ? (
          <View>
            <View style={styles.availabilityDays}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const isAvailable = trainer.availability?.some(avail => 
                  avail.day.toLowerCase().startsWith(day.toLowerCase().substring(0, 3))
                );
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.dayBadge,
                      isAvailable ? styles.availableDay : styles.unavailableDay
                    ]}
                  >
                    <Text 
                      style={[
                        styles.dayText,
                        isAvailable ? styles.availableDayText : styles.unavailableDayText
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
            
            <Text style={styles.hoursText}>
              Hours: {trainer.availability[0]?.startTime || '9:00'} - {trainer.availability[0]?.endTime || '17:00'}
            </Text>
          </View>
        ) : (
          <Text style={styles.noAvailabilityText}>Availability information not provided</Text>
        )}
      </Card>
      
      <View style={styles.actionsContainer}>
        <Button 
          title="Book Session" 
          onPress={handleBookSession}
          icon={<Calendar size={18} color={Colors.text.inverse} />}
          style={styles.actionButton}
          fullWidth
        />
        
        <Button 
          title="Message Trainer" 
          onPress={handleMessageTrainer}
          icon={<MessageSquare size={18} color={Colors.primary} />}
          variant="outline"
          style={styles.actionButton}
          fullWidth
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
  favoriteButton: {
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  customRatesContainer: {
    flex: 1,
  },
  customRatesTitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginBottom: 8,
  },
  customRateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  customRateTitle: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  customRateAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyIcon: {
    marginRight: 6,
  },
  specialtyText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  certificationsContainer: {
    marginTop: 4,
  },
  certification: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  pricingContainer: {
    marginTop: 4,
  },
  pricingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pricingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pricingDetails: {
    flex: 1,
  },
  pricingType: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  pricingValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingBottom: 8,
  },
  packageItem: {
    backgroundColor: Colors.background.darker,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  packageDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  availabilityDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableDay: {
    backgroundColor: Colors.primary,
  },
  unavailableDay: {
    backgroundColor: Colors.background.darker,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableDayText: {
    color: Colors.text.inverse,
  },
  unavailableDayText: {
    color: Colors.text.tertiary,
  },
  hoursText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  noAvailabilityText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
});