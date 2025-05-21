import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, RefreshCw, Info } from 'lucide-react-native';
import { useClientStore } from '@/store/client-store';
import { useAuthStore } from '@/store/auth-store';
import { TrainerCard } from '@/components/TrainerCard';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { useFocusEffect } from '@react-navigation/native';
import { Trainer } from '@/types';

export default function MyTrainersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    nearbyTrainers, 
    favoriteTrainers, 
    isLoading, 
    fetchNearbyTrainers,
    toggleFavoriteTrainer,
    debugTrainers,
    lastRefreshed
  } = useClientStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>(nearbyTrainers);
  const [refreshing, setRefreshing] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Fetch trainers when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadTrainers = async () => {
        if (user?.location) {
          try {
            await fetchNearbyTrainers(user.location.latitude, user.location.longitude);
          } catch (error) {
            console.error('Error fetching trainers:', error);
          }
        }
      };
      
      // Always fetch trainers when the screen is focused to ensure we have the latest data
      // This ensures newly registered trainers will appear in the list
      loadTrainers();
      
      return () => {}; // Cleanup function
    }, [user, fetchNearbyTrainers])
  );
  
  // Filter trainers based on search query and favorites filter
  useEffect(() => {
    let filtered = nearbyTrainers;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(trainer => 
        trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        trainer.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(trainer => 
        favoriteTrainers.includes(trainer.id)
      );
    }
    
    setFilteredTrainers(filtered);
  }, [nearbyTrainers, searchQuery, showFavoritesOnly, favoriteTrainers]);
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.location) {
        await fetchNearbyTrainers(user.location.latitude, user.location.longitude);
        Alert.alert("Refreshed", "Trainer data has been refreshed with the latest information.");
      }
    } catch (error) {
      console.error('Error refreshing trainers:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Navigate to trainer profile
  const navigateToTrainerProfile = (trainerId: string) => {
    router.push(`/trainer/${trainerId}`);
  };
  
  // Toggle favorite status
  const handleToggleFavorite = (trainerId: string) => {
    toggleFavoriteTrainer(trainerId);
  };
  
  // Show debug info
  const showDebugInfo = () => {
    debugTrainers();
  };
  
  // Render trainer card
  const renderTrainerCard = ({ item }: { item: Trainer }) => (
    <TrainerCard
      trainer={item}
      isFavorite={favoriteTrainers.includes(item.id)}
      onPress={() => navigateToTrainerProfile(item.id)}
      onToggleFavorite={() => handleToggleFavorite(item.id)}
    />
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {searchQuery 
          ? 'No trainers match your search' 
          : showFavoritesOnly 
            ? 'No favorite trainers yet' 
            : 'No trainers available'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? 'Try a different search term or clear your search' 
          : showFavoritesOnly 
            ? 'Add trainers to your favorites to see them here' 
            : 'Check back later for new trainers in your area'}
      </Text>
      {searchQuery && (
        <TouchableOpacity 
          style={styles.clearSearchButton}
          onPress={() => setSearchQuery('')}
        >
          <Text style={styles.clearSearchButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trainers..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={[
            styles.filterButton,
            showFavoritesOnly && styles.filterButtonActive
          ]}
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Filter size={20} color={showFavoritesOnly ? Colors.text.inverse : Colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredTrainers.length} trainer{filteredTrainers.length !== 1 ? 's' : ''} found
          {showFavoritesOnly ? ' (favorites only)' : ''}
        </Text>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing || isLoading}
        >
          <RefreshCw 
            size={16} 
            color={Colors.primary} 
            style={[refreshing && styles.refreshingIcon]} 
          />
          <Text style={styles.refreshButtonText}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading trainers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrainers}
          renderItem={renderTrainerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
      
      {/* Debug button */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={showDebugInfo}
      >
        <Info size={16} color={Colors.text.tertiary} />
        <Text style={styles.debugButtonText}>Debug Trainer Info</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.dark,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
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
    borderRadius: 12,
    backgroundColor: Colors.background.darker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  refreshButtonText: {
    ...typography.bodySmall,
    color: Colors.primary,
    marginLeft: 4,
  },
  refreshingIcon: {
    transform: [{ rotate: '45deg' }],
  },
  listContainer: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  clearSearchButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.darker,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    ...typography.bodyMedium,
    color: Colors.primary,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background.darker,
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  debugButtonText: {
    color: Colors.text.tertiary,
    fontSize: 12,
    marginLeft: 4,
  },
});