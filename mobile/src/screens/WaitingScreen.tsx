import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { apiClient } from '../services/api';
import { storage } from '../services/storage';
import { Clock, RefreshCw } from 'lucide-react-native';

export function WaitingScreen({ navigation }: any) {
  const [checking, setChecking] = useState(false);
  const [guestName, setGuestName] = useState('');

  const checkStatus = async () => {
    setChecking(true);
    try {
      const res = await apiClient('/api/me');
      if (res.guest) {
        setGuestName(res.guest.name);
        await storage.setGuest(res.guest);

        if (res.guest.status === 'active') {
          navigation.replace('MainTabs');
        }
      }
    } catch (err) {
      // offline or error
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    // Auto-poll every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Clock size={32} color={colors.warning} />
        </View>

        <Text style={styles.title}>Waiting for Host Approval</Text>
        <Text style={styles.subtitle}>
          Hi {guestName || 'there'}! The host requires approval before guests can enter the live event space.
        </Text>

        <View style={styles.statusBox}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusText}>Request Submitted • Checking...</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={checkStatus}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <>
              <RefreshCw size={16} color={colors.textPrimary} />
              <Text style={styles.refreshButtonText}>Check Status Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#451a03',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    marginBottom: 20,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
