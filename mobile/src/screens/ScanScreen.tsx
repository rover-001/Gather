import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { storage } from '../services/storage';
import { QrCode, Zap, ZapOff, Keyboard, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const SCAN_BOX_SIZE = width * 0.72;

export function ScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  const parseQr = (data: string) => {
    let slug = data.trim();
    let serverUrl: string | null = null;

    try {
      if (data.startsWith('http://') || data.startsWith('https://')) {
        const url = new URL(data);
        const match = url.pathname.match(/\/e\/([^/?#]+)/);
        if (match && match[1]) {
          slug = match[1];
          if (url.protocol === 'https:') {
            // For HTTPS urls (Tailscale Funnel, basic-ssl reverse proxy, cloud domain), use origin directly
            serverUrl = url.origin;
          } else {
            const host = (url.hostname === 'localhost' || url.hostname === '127.0.0.1') ? '127.0.0.1' : url.hostname;
            const port = url.port === '5173' ? '8080' : (url.port || '8080');
            serverUrl = `http://${host}:${port}`;
          }
        }
      } else if (data.startsWith('gather://e/')) {
        slug = data.replace('gather://e/', '').split('/')[0];
      }
    } catch {}

    return { slug, serverUrl };
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const { slug, serverUrl } = parseQr(data);

    if (serverUrl) {
      await storage.setServerUrl(serverUrl);
    }
    if (slug) {
      await storage.setEventSlug(slug);
    }

    // Directly navigate into Login screen with scanned event slug
    navigation.navigate('Login', { slug });

    // Allow re-scanning after 2 seconds if user goes back
    setTimeout(() => setScanned(false), 2000);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.iconCircle}>
          <QrCode size={40} color={colors.brand} />
        </View>
        <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
        <Text style={styles.permissionDesc}>
          Gather needs camera access to scan event QR codes and take photos.
        </Text>
        <TouchableOpacity style={styles.enableButton} onPress={requestPermission}>
          <Text style={styles.enableButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.manualFallback}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.manualFallbackText}>Or enter event code manually</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <SafeAreaView style={[styles.overlay, StyleSheet.absoluteFill]} pointerEvents="box-none">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Sparkles size={20} color={colors.brand} />
            <Text style={styles.brandText}>Gather</Text>
          </View>
          <TouchableOpacity
            style={styles.torchButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTorch(!torch);
            }}
          >
            {torch ? (
              <Zap size={20} color={colors.warning} />
            ) : (
              <ZapOff size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>

        {/* Viewfinder Target Reticle */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Scanning visual indicator */}
            <View style={styles.scanTarget}>
              <QrCode size={36} color="rgba(255,255,255,0.25)" />
            </View>
          </View>

          <Text style={styles.instructions}>Point camera at the event QR code</Text>
          <Text style={styles.instructionSub}>You will be taken directly into the event</Text>
        </View>

        {/* Bottom Manual Option */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Keyboard size={16} color={colors.textPrimary} />
            <Text style={styles.manualButtonText}>Enter Event Code Manually</Text>
          </TouchableOpacity>
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
  center: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    marginBottom: 24,
  },
  enableButton: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
  },
  enableButtonText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  manualFallback: {
    marginTop: 18,
  },
  manualFallbackText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  brandText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: -0.3,
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  viewfinderContainer: {
    alignItems: 'center',
  },
  viewfinder: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTarget: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.brand,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  instructions: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    marginTop: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  instructionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  manualButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
