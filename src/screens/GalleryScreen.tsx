import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { apiService } from '../services/api.service';
import { storageService } from '../services/storage.service';
import { NumberplateEntry } from '../types';

export const GalleryScreen = () => {
  const [numberplates, setNumberplates] = useState<NumberplateEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadNumberplates = async () => {
    try {
      const plates = await storageService.getNumberplates();
      setNumberplates(plates.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading numberplates:', error);
      Alert.alert('Error', 'Failed to load numberplates');
    }
  };

  const syncWithBackend = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      const updatedPlates = await apiService.syncNumberplates(numberplates);
      await storageService.saveNumberplates(updatedPlates);
      setNumberplates(updatedPlates.sort((a, b) => b.timestamp - a.timestamp));
      Alert.alert('Success', 'Numberplates synced with server');
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Failed', 'Failed to sync with server');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadNumberplates();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadNumberplates(), syncWithBackend()]);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: NumberplateEntry }) => (
    <View style={styles.item}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.score}>Score: {item.score}</Text>
        <Text style={styles.categories}>
          Categories: {item.categories.join(', ') || 'Processing...'}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={numberplates}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || isSyncing} 
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No numberplates yet. Take some photos!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 10,
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  details: {
    gap: 5,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categories: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 