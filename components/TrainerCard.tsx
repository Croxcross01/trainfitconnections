import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, Heart } from 'lucide-react-native';
import { Card } from './Card';
import { VerifiedBadge } from './VerifiedBadge';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { Trainer } from '@/types';

interface TrainerCardProps {
  trainer: Trainer;
  isFavorite?: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export const TrainerCard: React.FC<TrainerCardProps> = ({
  trainer,
  isFavorite = false,
  onPress,
  onToggleFavorite
}) => {
  const handleFavoritePress = (e: any) => {
    // Stop propagation to prevent navigating to trainer profile
    e.stopPropagation();
    onToggleFavorite();
  };
  
  // Use a default image if profileImage is not available
  const profileImageUrl = trainer.profileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000';
  
  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Image
          source={{ uri: profileImageUrl }}
          style={styles.profileImage}
        />
        
        <TouchableOpacity 
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive
          ]}
          onPress={handleFavoritePress}
        >
          <Heart
            size={16}
            color={isFavorite ? Colors.status.error : Colors.text.secondary}
            fill={isFavorite ? Colors.status.error : 'none'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{trainer.name}</Text>
          {trainer.verified && <VerifiedBadge style={styles.verifiedBadge} />}
        </View>
        
        <View style={styles.specialtiesContainer}>
          {trainer.specialties && trainer.specialties.length > 0 ? (
            trainer.specialties.slice(0, 2).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))
          ) : (
            <View style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>Personal Trainer</Text>
            </View>
          )}
        </View>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color={Colors.primary} fill={Colors.primary} />
          <Text style={styles.ratingText}>
            {trainer.rating?.toFixed(1) || '0.0'} 
            {trainer.reviewCount ? ` (${trainer.reviewCount})` : ''}
          </Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Rate:</Text>
          <Text style={styles.price}>
            ${trainer.hourlyRate || 0}/hr
          </Text>
        </View>
        
        <Text style={styles.bio} numberOfLines={2}>
          {trainer.bio || 'No bio available'}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  header: {
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    ...typography.bodyLarge,
    color: Colors.text.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specialtyTag: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    ...typography.bodySmall,
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  price: {
    ...typography.bodyMedium,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  bio: {
    ...typography.bodySmall,
    color: Colors.text.secondary,
  },
});