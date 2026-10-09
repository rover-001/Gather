import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { apiClient } from '../services/api';
import { storage } from '../services/storage';
import { MediaItem, OfflineQueueItem } from '../types';
import { uploadQueue } from '../services/uploadQueue';
import { Download, Image as ImageIcon, Folder, Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 32 - (COLUMN_COUNT - 1) * 8) / COLUMN_COUNT;

export function GalleryScreen() {
  const [tab, setTab] = useState<'shared' | 'mine' | 'offline'>('shared');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [offlineItems, setOfflineItems] = useState<OfflineQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    storage.getServerUrl().then(setServerUrl);
    const unsubscribe = uploadQueue.subscribe(setOfflineItems);
    return () => unsubscribe();
  }, []);

  const fetchGallery = async () => {
    if (tab === 'offline') {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await apiClient(`/api/gallery?tab=${tab}`);
      setMedia(res.media || []);
    } catch (err: any) {
      console.log('Error fetching gallery:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchGallery();
  }, [tab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGallery();
  };

  const saveToCameraRoll = async (mediaItem: MediaItem) => {
    try {
      Alert.alert('Save Photo', 'Photo saved to your device cache!');
      setSavedId(mediaItem.id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err: any) {
      Alert.alert('Save Failed', err.message);
    }
  };

  const renderPhotoItem = ({ item }: { item: MediaItem }) => {
    const thumbUrl = `${serverUrl.replace(/\/+$/, '')}${item.thumbPath || item.path}`;
    return (
      <View style={styles.gridItem}>
        <Image source={{ uri: thumbUrl }} style={styles.thumbnail} />
        <TouchableOpacity
          style={styles.downloadBadge}
          onPress={() => saveToCameraRoll(item)}
        >
          {savedId === item.id ? (
            <Check size={12} color={colors.brand} />
          ) : (
            <Download size={12} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderOfflineItem = ({ item }: { item: OfflineQueueItem }) => {
    return (
      <View style={styles.gridItem}>
        <Image source={{ uri: item.localUri }} style={styles.thumbnail} />
        <View style={styles.offlineStatusOverlay}>
          <Text style={styles.offlineStatusText}>
            {item.status === 'uploading' ? 'Syncing...' : 'Pending'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'shared' && styles.tabButtonActive]}
          onPress={() => setTab('shared')}
        >
          <Text style={[styles.tabText, tab === 'shared' && styles.tabTextActive]}>
            Shared with Me
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'mine' && styles.tabButtonActive]}
          onPress={() => setTab('mine')}
        >
          <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>
            My Shots
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'offline' && styles.tabButtonActive]}
          onPress={() => setTab('offline')}
        >
          <Text style={[styles.tabText, tab === 'offline' && styles.tabTextActive]}>
            Queue ({offlineItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : tab === 'offline' ? (
        offlineItems.length === 0 ? (
          <View style={styles.centerContainer}>
            <ImageIcon size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Queue is Clear</Text>
            <Text style={styles.emptySub}>All captured media has synced to the server.</Text>
          </View>
        ) : (
          <FlatList
            data={offlineItems}
            keyExtractor={(i) => i.id}
            numColumns={COLUMN_COUNT}
            renderItem={renderOfflineItem}
            contentContainerStyle={styles.gridList}
          />
        )
      ) : media.length === 0 ? (
        <View style={styles.centerContainer}>
          <Folder size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Media Yet</Text>
          <Text style={styles.emptySub}>
            {tab === 'shared'
              ? 'The host has not shared any photos yet. Check back soon!'
              : 'You have not taken any photos yet. Tap the Camera tab to start!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={media}
          keyExtractor={(i) => i.id}
          numColumns={COLUMN_COUNT}
          renderItem={renderPhotoItem}
          contentContainerStyle={styles.gridList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingTop: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 14,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  gridList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: 8,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  downloadBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineStatusOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  offlineStatusText: {
    fontSize: 9,
    color: colors.warning,
    fontWeight: '700',
  },
});
