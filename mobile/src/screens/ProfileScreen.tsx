import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors';
import { apiClient } from '../services/api';
import { storage } from '../services/storage';
import { GuestProfile } from '../types';
import {
  User,
  Phone,
  ShieldCheck,
  KeyRound,
  LogOut,
  Server,
} from 'lucide-react-native';

export function ProfileScreen({ navigation }: any) {
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [savingServer, setSavingServer] = useState(false);

  useEffect(() => {
    storage.getGuest().then(setGuest);
    storage.getServerUrl().then(setServerUrl);

    // Refresh profile from server
    apiClient('/api/me')
      .then((res) => {
        if (res.guest) {
          setGuest(res.guest);
          storage.setGuest(res.guest);
        }
      })
      .catch(() => {});
  }, []);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters.');
      return;
    }

    setSavingPw(true);
    try {
      await apiClient('/api/me/password', {
        method: 'POST',
        body: JSON.stringify({
          oldPassword: guest?.mustChangePassword ? undefined : oldPassword,
          newPassword,
        }),
      });

      Alert.alert('Success', 'Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  const handleSaveServerUrl = async () => {
    if (!serverUrl.trim()) return;
    setSavingServer(true);
    try {
      await storage.setServerUrl(serverUrl.trim());
      Alert.alert('Saved', 'Server address updated.');
    } finally {
      setSavingServer(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient('/api/logout', { method: 'POST' });
          } catch {}
          await storage.clearToken();
          await storage.clearGuest();
          navigation.reset({ index: 0, routes: [{ name: 'Scan' }] });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {guest?.name ? guest.name.substring(0, 2).toUpperCase() : 'G'}
          </Text>
        </View>

        <Text style={styles.name}>{guest?.name || 'Guest User'}</Text>
        <View style={styles.phoneRow}>
          <Phone size={14} color={colors.textSecondary} />
          <Text style={styles.phoneText}>+{guest?.phone}</Text>
        </View>

        <View style={styles.badge}>
          <ShieldCheck size={14} color={colors.brand} />
          <Text style={styles.badgeText}>Active Event Participant</Text>
        </View>
      </View>

      {/* Change Password Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <KeyRound size={18} color={colors.brand} />
          <Text style={styles.cardTitle}>Change Password</Text>
        </View>

        {!guest?.mustChangePassword && (
          <>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </>
        )}

        <Text style={styles.inputLabel}>New Password (min 6 chars)</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={savingPw}
        >
          {savingPw ? (
            <ActivityIndicator size="small" color={colors.black} />
          ) : (
            <Text style={styles.saveButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Host Endpoint Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Server size={18} color={colors.textSecondary} />
          <Text style={styles.cardTitle}>Server & Hotspot URL</Text>
        </View>

        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.9:8080"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSaveServerUrl}
          disabled={savingServer}
        >
          <Text style={styles.secondaryButtonText}>Save Server Address</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={18} color={colors.live} />
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.black,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderMuted,
  },
  badgeText: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  saveButtonText: {
    color: colors.black,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  logoutButtonText: {
    color: colors.live,
    fontSize: 14,
    fontWeight: '700',
  },
});
