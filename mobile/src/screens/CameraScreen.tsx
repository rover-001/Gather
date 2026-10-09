import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { colors } from '../theme/colors';
import { uploadQueue } from '../services/uploadQueue';
import { LivePreviewStreamer } from '../services/cameraStream';
import { OfflineQueueItem } from '../types';
import {
  Camera as CameraIcon,
  SwitchCamera,
  Zap,
  ZapOff,
  CloudUpload,
  Radio,
  CheckCircle,
} from 'lucide-react-native';

export function CameraScreen() {
  useKeepAwake();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [streamStatus, setStreamStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [capturing, setCapturing] = useState(false);

  const cameraRef = useRef<any>(null);
  const streamerRef = useRef<LivePreviewStreamer | null>(null);

  // Subscribe to upload queue updates
  useEffect(() => {
    const unsubscribe = uploadQueue.subscribe(setQueue);
    return () => unsubscribe();
  }, []);

  // Initialize live preview streamer
  useEffect(() => {
    const streamer = new LivePreviewStreamer((status) => {
      setStreamStatus(status);
    });
    streamerRef.current = streamer;
    streamer.start();

    return () => {
      streamer.stop();
    };
  }, []);

  const toggleFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  };

  const takePicture = async () => {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        // Enqueue immediately so camera does not block
        await uploadQueue.enqueuePhoto(photo.uri);
      }
    } catch (err) {
      console.error('Error capturing photo:', err);
    } finally {
      setCapturing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <CameraIcon size={48} color={colors.textSecondary} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionDesc}>
          Gather needs camera access so you can capture photos and stream live previews to the event host.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Enable Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const uploadingCount = queue.filter((i) => i.status === 'uploading' || i.status === 'pending').length;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={flash === 'on'}
      />
      <SafeAreaView style={[styles.overlay, StyleSheet.absoluteFill]} pointerEvents="box-none">
        {/* Top Controls Bar */}
        <View style={styles.topBar}>
          {/* Live Stream Indicator */}
          <View style={styles.liveBadge}>
            <Radio
              size={14}
              color={streamStatus === 'connected' ? colors.live : colors.textMuted}
            />
            <Text
              style={[
                styles.liveText,
                streamStatus === 'connected' && { color: colors.live },
              ]}
            >
              {streamStatus === 'connected'
                ? 'LIVE WALL'
                : streamStatus === 'reconnecting'
                ? 'RECONNECTING'
                : 'OFFLINE'}
            </Text>
          </View>

          {/* Flash & Flip Buttons */}
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
              {flash === 'on' ? (
                <Zap size={20} color={colors.warning} />
              ) : (
                <ZapOff size={20} color={colors.white} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFacing}>
              <SwitchCamera size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload Status Floating Pill */}
        {uploadingCount > 0 && (
          <View style={styles.uploadPill}>
            <CloudUpload size={14} color={colors.brand} />
            <Text style={styles.uploadPillText}>
              Syncing {uploadingCount} {uploadingCount === 1 ? 'photo' : 'photos'} in background...
            </Text>
          </View>
        )}

        {/* Bottom Shutter Controls */}
        <View style={styles.bottomBar}>
          <View style={styles.shutterContainer}>
            <TouchableOpacity
              style={[styles.shutterButton, capturing && styles.shutterCapturing]}
              onPress={takePicture}
              disabled={capturing}
              activeOpacity={0.8}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
  },
  permissionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  permissionButtonText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  topActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  uploadPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadPillText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBar: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  shutterContainer: {
    alignItems: 'center',
  },
  shutterButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterCapturing: {
    borderColor: colors.brand,
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.white,
  },
});
