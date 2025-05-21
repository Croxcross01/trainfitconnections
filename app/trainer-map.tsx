import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, List, MapPin, RefreshCw, Info } from 'lucide-react-native';
import { useClientStore } from '@/store/client-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { useFocusEffect } from '@react-navigation/native';

export default function TrainerMapScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    nearbyTrainers, 
    isLoading, 
    fetchNearbyTrainers,
    debugTrainers,
    lastRefreshed
  } = useClientStore();
  
  const [refreshing, setRefreshing] = useState(false);
  
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
      
      // Always fetch when screen is focused to ensure we have the latest data
      loadTrainers();
      
      // Set up auto-refresh interval
      const refreshInterval = setInterval(() => {
        if (user?.location) {
          fetchNearbyTrainers(user.location.latitude, user.location.longitude);
        }
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(refreshInterval);
    }, [user])
  );
  
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
  
  // Navigate to list view
  const navigateToListView = () => {
    router.push('/(tabs)/my-trainers');
  };
  
  // Show debug info
  const showDebugInfo = () => {
    debugTrainers();
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={styles.title}>Find Trainers</Text>
        
        <TouchableOpacity 
          style={styles.listViewButton}
          onPress={navigateToListView}
        >
          <List size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.webMapPlaceholder}>
            <MapPin size={48} color={Colors.primary} />
            <Text style={styles.webMapText}>Map view is not available on web</Text>
            <Text style={styles.webMapSubtext}>Please use the list view to browse trainers</Text>
            <TouchableOpacity 
              style={styles.webMapButton}
              onPress={navigateToListView}
            >
              <Text style={styles.webMapButtonText}>Go to List View</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color={Colors.primary} />
            <Text style={styles.mapPlaceholderText}>Map View</Text>
            <Text style={styles.mapPlaceholderSubtext}>
              {isLoading 
                ? 'Loading trainer locations...' 
                : `${nearbyTrainers.length} trainers available in your area`}
            </Text>
            {isLoading && <ActivityIndicator color={Colors.primary} style={styles.mapLoader} />}
          </View>
        )}
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {nearbyTrainers.length} trainer{nearbyTrainers.length !== 1 ? 's' : ''} found in your area
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
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Looking for a trainer?</Text>
        <Text style={styles.infoText}>
          Browse our list of qualified fitness professionals in your area. 
          You can view their profiles, specialties, and book sessions directly.
        </Text>
        <TouchableOpacity 
          style={styles.listButton}
          onPress={navigateToListView}
        >
          <Text style={styles.listButtonText}>View as List</Text>
        </TouchableOpacity>
      </View>
      
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    padding: 8,
  },
  title: {
    ...typography.h4,
    color: Colors.text.primary,
  },
  listViewButton: {
    padding: 8,
  },
  mapContainer: {
    height: 300,
    width: '100%',
    backgroundColor: Colors.background.darker,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
  },
  mapPlaceholderText: {
    ...typography.h4,
    color: Colors.text.primary,
    marginTop: 16,
  },
  mapPlaceholderSubtext: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginTop: 8,
  },
  mapLoader: {
    marginTop: 16,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.darker,
  },
  webMapText: {
    ...typography.h4,
    color: Colors.text.primary,
    marginTop: 16,
  },
  webMapSubtext: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginTop: 8,
    marginBottom: 16,
  },
  webMapButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  webMapButtonText: {
    ...typography.bodyMedium,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
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
  infoContainer: {
    padding: 16,
  },
  infoTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    ...typography.bodyMedium,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  listButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  listButtonText: {
    ...typography.bodyMedium,
    color: Colors.text.inverse,
    fontWeight: '600',
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