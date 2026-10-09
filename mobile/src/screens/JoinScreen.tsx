import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { apiClient } from '../services/api';
import { storage } from '../services/storage';
import { Lock, Settings, Sparkles, QrCode } from 'lucide-react-native';

export function JoinScreen({ route, navigation }: any) {
  const [slug, setSlug] = useState(route?.params?.slug || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(route?.params?.phone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  React.useEffect(() => {
    if (route?.params?.slug) {
      setSlug(route.params.slug);
    } else {
      storage.getEventSlug().then((saved) => {
        if (saved) setSlug(saved);
      });
    }
    if (route?.params?.phone) {
      setPhone(route.params.phone);
    }
  }, [route?.params?.slug, route?.params?.phone]);

  React.useEffect(() => {
    storage.getServerUrl().then(setServerUrl);
  }, []);

  const handleJoin = async () => {
    if (!slug.trim()) {
      Alert.alert('Required', 'Please enter an event code/slug');
      return;
    }
    if (!name.trim() || !phone.trim() || password.length < 6) {
      Alert.alert('Validation Error', 'Name, phone number, and password (at least 6 characters) are required.');
      return;
    }

    setLoading(true);
    try {
      if (serverUrl.trim()) {
        await storage.setServerUrl(serverUrl.trim());
      }

      const res = await apiClient(`/api/events/${slug.trim()}/join`, {
        method: 'POST',
        body: JSON.stringify({ name, phone, password }),
      });

      if (res.guest) {
        if (res.token) {
          await storage.setToken(res.token);
        }
        await storage.setGuest(res.guest);
        await storage.setEventSlug(slug.trim());

        if (res.guest.status === 'pending') {
          navigation.replace('Waiting');
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
      }
    } catch (err: any) {
      if (err.data?.alreadyJoined) {
        Alert.alert(
          'Already Joined',
          'This phone number is already registered for this event. Would you like to log in?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log In', onPress: () => navigation.navigate('Login', { slug, phone }) },
          ]
        );
      } else {
        Alert.alert('Join Failed', err.message || 'Could not join event. Please check the event code.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Sparkles size={28} color={colors.brand} />
          </View>
          <Text style={styles.title}>Gather</Text>
          <Text style={styles.subtitle}>Enter an event code or scan the host's QR to begin sharing.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Event Code (Slug)</Text>
          <TextInput
            style={styles.input}
            value={slug}
            onChangeText={setSlug}
            placeholder="e.g. wedding-party"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Alex Rivera"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +1 555 123 4567"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Create Password (min 6 chars)</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={styles.joinButtonText}>Join Event</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('Scan')}
          >
            <QrCode size={16} color={colors.textPrimary} />
            <Text style={styles.scanButtonText}>Scan Event QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login', { slug })}
          >
            <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>

        {/* Server & LAN Settings Toggle */}
        <TouchableOpacity
          style={styles.configToggle}
          onPress={() => setShowConfig(!showConfig)}
        >
          <Settings size={14} color={colors.textMuted} />
          <Text style={styles.configToggleText}>Host Server / Hotspot Settings</Text>
        </TouchableOpacity>

        {showConfig && (
          <View style={styles.configCard}>
            <Text style={styles.configLabel}>API Endpoint (LAN or Tunnel)</Text>
            <TextInput
              style={styles.configInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://192.168.1.9:8080"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinButton: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  joinButtonText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '700',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 14,
  },
  loginLinkText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '600',
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  configToggleText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  configCard: {
    marginTop: 12,
    padding: 14,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  configLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  configInput: {
    fontSize: 12,
    color: colors.textPrimary,
  },
});
