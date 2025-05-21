import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Plus, Filter, Grid, List, Heart, Trash2, Edit, Camera } from 'lucide-react-native';
import { useTrainerStore } from '@/store/trainer-store';
import { useAuthStore } from '@/store/auth-store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Colors from '@/constants/colors';
import { typography } from '@/styles/typography';
import { layout } from '@/styles/layout';
import { Photo } from '@/types';

const { width } = Dimensions.get('window');
const photoSize = (width - 48) / 2; // 2 columns with 16px padding and 16px gap

export default function PhotosScreen() {
  const router = useRouter();
  const { photos, likePhoto, deletePhoto } = useTrainerStore();
  const { user } = useAuthStore();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'results', name: 'Results' },
    { id: 'workout', name: 'Workouts' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'facility', name: 'Facility' },
    { id: 'other', name: 'Other' },
  ];
  
  // Filter photos based on selected category
  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);
  
  const handleAddPhoto = () => {
    // Navigate to add photo screen
    router.push('/trainer/add-photo');
  };
  
  const handleEditPhoto = (photo: Photo) => {
    // Navigate to edit photo screen
    router.push(`/trainer/edit-photo/${photo.id}`);
  };
  
  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deletePhoto(photoId),
          style: "destructive"
        }
      ]
    );
  };
  
  const renderGridItem = ({ item }: { item: Photo }) => {
    const isBeforeAfter = item.isBeforeAfter && item.beforeImageUrl;
    
    return (
      <Card 
        style={[styles.photoCard, isBeforeAfter && styles.beforeAfterCard]} 
        variant="elevated"
        onPress={() => {/* Navigate to photo detail */}}
      >
        {isBeforeAfter ? (
          <View style={styles.beforeAfterContainer}>
            <View style={styles.beforeContainer}>
              <Image 
                source={{ uri: item.beforeImageUrl }}
                style={styles.beforeImage}
              />
              <View style={styles.beforeLabel}>
                <Text style={styles.beforeAfterLabelText}>Before</Text>
              </View>
            </View>
            <View style={styles.afterContainer}>
              <Image 
                source={{ uri: item.imageUrl }}
                style={styles.afterImage}
              />
              <View style={styles.afterLabel}>
                <Text style={styles.beforeAfterLabelText}>After</Text>
              </View>
            </View>
          </View>
        ) : (
          <Image 
            source={{ uri: item.imageUrl }}
            style={styles.photoImage}
          />
        )}
        
        <View style={styles.photoInfo}>
          <Text style={styles.photoTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.photoMeta}>
            <TouchableOpacity 
              style={styles.likeButton}
              onPress={() => likePhoto(item.id)}
            >
              <Heart 
                size={16} 
                color={Colors.status.error} 
                fill={Colors.status.error}
              />
              <Text style={styles.likeCount}>{item.likes}</Text>
            </TouchableOpacity>
            
            <View style={styles.photoActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditPhoto(item)}
              >
                <Edit size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeletePhoto(item.id)}
              >
                <Trash2 size={16} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  };
  
  const renderListItem = ({ item }: { item: Photo }) => {
    const isBeforeAfter = item.isBeforeAfter && item.beforeImageUrl;
    
    return (
      <Card style={styles.listItemCard} variant="elevated">
        {isBeforeAfter ? (
          <View style={styles.listBeforeAfterContainer}>
            <Image 
              source={{ uri: item.beforeImageUrl }}
              style={styles.listBeforeImage}
            />
            <Image 
              source={{ uri: item.imageUrl }}
              style={styles.listAfterImage}
            />
          </View>
        ) : (
          <Image 
            source={{ uri: item.imageUrl }}
            style={styles.listItemImage}
          />
        )}
        
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle}>{item.title}</Text>
          
          {item.description && (
            <Text style={styles.listItemDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <View style={styles.listItemFooter}>
            <View style={styles.listItemMeta}>
              <Text style={styles.listItemDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              
              <View style={styles.listItemLikes}>
                <Heart 
                  size={14} 
                  color={Colors.status.error} 
                  fill={Colors.status.error}
                />
                <Text style={styles.listItemLikeCount}>{item.likes}</Text>
              </View>
            </View>
            
            <View style={styles.listItemActions}>
              <TouchableOpacity 
                style={styles.listItemAction}
                onPress={() => handleEditPhoto(item)}
              >
                <Edit size={16} color={Colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.listItemAction}
                onPress={() => handleDeletePhoto(item.id)}
              >
                <Trash2 size={16} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  };
  
  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Photo Gallery',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleAddPhoto}
            >
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={layout.screen}>
        <View style={styles.filterContainer}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.categoryChip,
                  selectedCategory === item.id && styles.activeCategoryChip
                ]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text 
                  style={[
                    styles.categoryChipText,
                    selectedCategory === item.id && styles.activeCategoryChipText
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
          
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[
                styles.viewToggleButton,
                viewMode === 'grid' && styles.activeViewToggleButton
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Grid 
                size={20} 
                color={viewMode === 'grid' ? Colors.primary : Colors.text.secondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.viewToggleButton,
                viewMode === 'list' && styles.activeViewToggleButton
              ]}
              onPress={() => setViewMode('list')}
            >
              <List 
                size={20} 
                color={viewMode === 'list' ? Colors.primary : Colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {filteredPhotos.length > 0 ? (
          viewMode === 'grid' ? (
            <FlatList
              data={filteredPhotos}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.photoGrid}
              contentContainerStyle={styles.photoList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={filteredPhotos}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.photoList}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : (
          <View style={styles.emptyState}>
            <Camera size={64} color={Colors.text.secondary} />
            <Text style={styles.emptyStateTitle}>No photos yet</Text>
            <Text style={styles.emptyStateText}>
              Share your training results, workouts, and more with your clients.
            </Text>
            <Button
              title="Add Your First Photo"
              icon={<Plus size={18} color={Colors.text.inverse} />}
              iconPosition="left"
              style={styles.addPhotoButton}
              onPress={handleAddPhoto}
            />
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  categoriesList: {
    paddingRight: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  activeCategoryChip: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: Colors.primary,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
    overflow: 'hidden',
  },
  viewToggleButton: {
    padding: 8,
    backgroundColor: Colors.background.card,
  },
  activeViewToggleButton: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  photoList: {
    padding: 16,
  },
  photoGrid: {
    justifyContent: 'space-between',
  },
  photoCard: {
    width: photoSize,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  beforeAfterCard: {
    width: width - 32,
  },
  photoImage: {
    width: '100%',
    height: photoSize,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  beforeAfterContainer: {
    flexDirection: 'row',
    height: 200,
  },
  beforeContainer: {
    flex: 1,
    position: 'relative',
  },
  afterContainer: {
    flex: 1,
    position: 'relative',
  },
  beforeImage: {
    width: '100%',
    height: '100%',
  },
  afterImage: {
    width: '100%',
    height: '100%',
  },
  beforeLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  afterLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  beforeAfterLabelText: {
    fontSize: 12,
    color: Colors.text.inverse,
    fontWeight: '500',
  },
  photoInfo: {
    padding: 12,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  photoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  photoActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // List view styles
  listItemCard: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  listItemImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  listBeforeAfterContainer: {
    width: 120,
    height: 120,
    flexDirection: 'column',
  },
  listBeforeImage: {
    width: 120,
    height: 60,
    borderTopLeftRadius: 16,
  },
  listAfterImage: {
    width: 120,
    height: 60,
    borderBottomLeftRadius: 16,
  },
  listItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  listItemMeta: {
    flex: 1,
  },
  listItemDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 4,
  },
  listItemLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemLikeCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  listItemActions: {
    flexDirection: 'row',
  },
  listItemAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    ...typography.h4,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addPhotoButton: {
    width: '80%',
    maxWidth: 300,
  },
});