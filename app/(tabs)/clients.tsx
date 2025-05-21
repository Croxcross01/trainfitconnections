import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useTrainerStore } from '@/store/trainer-store';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';
import { Client } from '@/types';
import Colors from '@/constants/colors';

export default function ClientsScreen() {
  const router = useRouter();
  const { clients } = useTrainerStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect non-trainers away from this page
  useEffect(() => {
    if (user?.role !== 'trainer') {
      router.replace('/');
    }
  }, [user, router]);

  // If not a trainer, don't render the content
  if (user?.role !== 'trainer') {
    return null;
  }
  
  // Filter clients based on search query
  const filteredClients = searchQuery.trim() === ''
    ? clients
    : clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  const handleClientPress = (client: Client) => {
    // Navigate to client details
    router.push(`/client/${client.id}`);
  };
  
  const handleAddClient = () => {
    // Navigate to add client screen
    router.push('/add-client');
  };
  
  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => handleClientPress(item)}
    >
      <Card style={styles.clientCard}>
        <View style={styles.clientInfo}>
          <Image
            source={{ uri: item.profileImage }}
            style={styles.clientImage}
          />
          <View style={styles.clientDetails}>
            <Text style={styles.clientName}>{item.name}</Text>
            <Text style={styles.clientEmail}>{item.email}</Text>
            
            <View style={styles.goalsContainer}>
              {item.goals?.map((goal, index) => (
                <View key={index} style={styles.goalBadge}>
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.clientFooter}>
          {item.fitnessLevel && (
            <View style={[
              styles.levelBadge,
              item.fitnessLevel === 'beginner' && styles.beginnerBadge,
              item.fitnessLevel === 'intermediate' && styles.intermediateBadge,
              item.fitnessLevel === 'advanced' && styles.advancedBadge,
            ]}>
              <Text style={styles.levelText}>
                {item.fitnessLevel.charAt(0).toUpperCase() + item.fitnessLevel.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Clients",
          headerRight: () => (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddClient}
            >
              <Plus size={20} color={Colors.text.inverse} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Clients</Text>
        
        {/* Add floating action button for adding clients */}
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={handleAddClient}
        >
          <Plus size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
          style={styles.input}
        />
      </View>
      
      {filteredClients.length > 0 ? (
        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item.id}
          renderItem={renderClientItem}
          contentContainerStyle={styles.clientList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Clients Found</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery.trim() !== '' 
              ? "No clients match your search criteria"
              : "You don't have any clients yet"}
          </Text>
          <TouchableOpacity
            style={styles.addClientButton}
            onPress={handleAddClient}
          >
            <Text style={styles.addClientText}>Add New Client</Text>
          </TouchableOpacity>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  floatingAddButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    marginBottom: 0,
  },
  input: {
    paddingLeft: 40,
    backgroundColor: Colors.background.card,
  },
  clientList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  clientCard: {
    marginBottom: 16,
    backgroundColor: Colors.background.card,
  },
  clientInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  clientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  clientDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  goalBadge: {
    backgroundColor: Colors.background.darker,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  goalText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  clientFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  beginnerBadge: {
    backgroundColor: Colors.secondary,
  },
  intermediateBadge: {
    backgroundColor: Colors.primary,
  },
  advancedBadge: {
    backgroundColor: Colors.status.info,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.inverse,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addClientButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addClientText: {
    color: Colors.text.inverse,
    fontWeight: '500',
  },
});