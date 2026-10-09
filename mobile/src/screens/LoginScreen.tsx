import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { apiClient } from '../services/api';
import { storage } from '../services/storage';
import { KeyRound, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react-native';

export function LoginScreen({ route, navigation }: any) {
  const [slug, setSlug] = useState(route.params?.slug || '');
  const [phone, setPhone] = useState(route.params?.phone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventName, setEventName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false);

  React.useEffect(() => {
    if (route.params?.slug) {
      setSlug(route.params.slug);
    } else {
      storage.getEventSlug().then((saved) => {
        if (saved) setSlug(saved);
      });
    }
    if (route.params?.phone) {
      setPhone(route.params.phone);
    }
  }, [route.params?.slug, route.params?.phone]);

  React.useEffect(() => {
    if (slug.trim()) {
      apiClient(`/api/events/${slug.trim()}`)
        .then((res) => {
          if (res.event?.name) setEventName(res.event.name);
        })
        .catch(() => setEventName(null));
    } else {
      setEventName(null);
    }
  }, [slug]);

  const handleLogin = async () => {
    if (!slug.trim()) {
      Alert.alert('Required', 'Please enter or scan an event code.');
      return;
    }
    if (!phone.trim() || !password) {
      Alert.alert('Required', 'Please enter your phone number and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setIsNotRegistered(false);

    try {
      const res = await apiClient(`/api/events/${slug.trim()}/login`, {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
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
      const msg = err.message || '';
      if (msg.includes('No account found') || err.data?.error?.includes('No account found')) {
        setIsNotRegistered(true);
        setErrorMessage('No account found for this phone number in this event.');
        Alert.alert(
          'Account Not Found',
          'No account was found with this phone number. Would you like to sign up for this event?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Sign Up',
              onPress: () => navigation.navigate('Join', { slug: slug.trim(), phone: phone.trim() }),
            },
          ]
        );
      } else {
        setErrorMessage(msg || 'Incorrect password or phone number.');
        Alert.alert('Login Failed', msg || 'Incorrect password or phone number.');
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Scan')}>
          <ArrowLeft size={20} color={colors.textSecondary} />
          <Text style={styles.backButtonText}>Scan QR</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <KeyRound size={24} color={colors.brand} />
          </View>

          <Text style={styles.title}>Guest Login</Text>
          <Text style={styles.subtitle}>Enter your phone and password to enter the event.</Text>

          {slug ? (
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeLabel}>
                {eventName ? `${eventName} (${slug})` : `Event: ${slug}`}
              </Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <View style={styles.errorRow}>
                <AlertCircle size={16} color={colors.live} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
              {isNotRegistered && (
                <TouchableOpacity
                  style={styles.errorActionBtn}
                  onPress={() => navigation.navigate('Join', { slug: slug.trim(), phone: phone.trim() })}
                >
                  <UserPlus size={14} color={colors.black} />
                  <Text style={styles.errorActionBtnText}>Register Now for this Event</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          <Text style={styles.label}>Event Code (Slug)</Text>
          <TextInput
            style={styles.input}
            value={slug}
            onChangeText={(txt) => {
              setSlug(txt);
              setErrorMessage(null);
              setIsNotRegistered(false);
            }}
            placeholder="e.g. demo"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={(txt) => {
              setPhone(txt);
              setErrorMessage(null);
              setIsNotRegistered(false);
            }}
            placeholder="e.g. +1 555 123 4567"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrorMessage(null);
            }}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Join', { slug: slug.trim(), phone: phone.trim() })}
          >
            <Text style={styles.registerLinkText}>New to this event? Register here</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanLink}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.scanLinkText}>Scan a different QR code</Text>
          </TouchableOpacity>
        </View>
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
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  errorActionBtn: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  errorActionBtnText: {
    color: colors.black,
    fontSize: 12,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
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
  loginButton: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: colors.black,
    fontSize: 15,
    fontWeight: '700',
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventBadgeLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  eventBadgeSlug: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerLinkText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
  },
  scanLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  scanLinkText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
