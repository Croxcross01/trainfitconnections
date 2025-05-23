import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, List, RefreshCw, Info } from 'lucide-react-native';
import { useClientStore } from '@/store/client-store';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';

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
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: user?.location?.latitude || 30.2672,
            longitude: user?.location?.longitude || -97.7431,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          customMapStyle={darkMapStyle}
        >
          {nearbyTrainers.map((trainer) =>
            trainer.location ? (
              <Marker
                key={trainer.id}
                coordinate={{
                  latitude: trainer.location.latitude,
                  longitude: trainer.location.longitude,
                }}
                title={trainer.name}
                description={trainer.bio}
              />
            ) : null
          )}
        </MapView>
        {isLoading && (
          <View style={styles.mapLoaderOverlay}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.mapLoaderText}>Loading trainer locations...</Text>
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

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#383838' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f2f2f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];

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
  mapLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoaderText: {
    color: Colors.text.primary,
    marginTop: 12,
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