import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useLogout } from '@/context/AuthContext';
import { usersAPI } from '@/services/users';
import { storage } from '@/stores/mmkv';
import { toast } from '@/util/toast';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logout = useLogout();

  const userMasterId = useMemo(() => {
    if (!params.userMasterId) return null;
    return Array.isArray(params.userMasterId) ? params.userMasterId[0] : params.userMasterId;
  }, [params.userMasterId]);

  const source = useMemo(() => {
    if (!params.source) return null;
    return Array.isArray(params.source) ? params.source[0] : params.source;
  }, [params.source]);

  const isFromSettings = source === 'settings';

  const validateInputs = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all password fields.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirmation do not match.');
      return false;
    }
    if (newPassword.length < 8) {
      Alert.alert('Weak Password', 'New password must be at least 8 characters.');
      return false;
    }
    if (!userMasterId) {
      Alert.alert('Missing User', 'Unable to locate user details. Please log in again.');
      return false;
    }
    return true;
  };

  const getErrorMessage = (payload: any) => {
    const errorData = payload?.data || payload;
    if (errorData?.description) {
      return errorData.description.replace(/^[^:]*::\s*/, '');
    }
    return errorData?.message || payload?.message || 'Unable to update password. Please try again.';
  };

  const handleChangePassword = async () => {
    if (!validateInputs()) return;

    try {
      setIsSubmitting(true);
      const response = await usersAPI.changePassword({
        userMasterId,
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response?.success === true || response?.status === 200 || response?.status === 201) {
        storage.remove('token');
        toast.success('Password Updated', 'Please sign in with your new password.');
        logout();
        return;
      }

      const message = getErrorMessage(response);
      Alert.alert('Update Failed', message);
    } catch (error: any) {
      const message = getErrorMessage(error);
      Alert.alert('Update Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/login' as any);
  };

  const handleBackToSettings = () => {
    if (currentPassword || newPassword || confirmPassword) {
      Alert.alert('Discard Changes', 'Are you sure you want to go back? Unsaved changes will be lost.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go Back',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDark ? colors.dark.background : '#FDF5E6' }}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 bg-[#FDF5E6] px-6 pt-6 dark:bg-gray-900">
              {/* Header section */}
              <View className="mb-8 items-center">
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: isDark ? 'rgba(218,165,33,0.15)' : 'rgba(218,165,33,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Ionicons
                    name="lock-closed"
                    size={32}
                    color={colors.common.primary}
                  />
                </View>
                <Text
                  style={{ fontFamily: 'Poppins_700Bold', fontSize: 22, color: isDark ? '#f9fafb' : '#111827', marginBottom: 6 }}
                >
                  Update Your Password
                </Text>
                <Text
                  style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: isDark ? '#9ca3af' : '#6b7280', textAlign: 'center', lineHeight: 20 }}
                >
                  Choose a strong password to keep{'\n'}your account secure
                </Text>
              </View>

              <View className="space-y-5">
                <View className="relative p-1">
                  <View className="absolute left-4 top-4 z-10">
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={isDark ? colors.dark.textSecondary : colors.common.accent}
                    />
                  </View>
                  <TextInput
                    style={{
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      paddingVertical: 14,
                      paddingLeft: 48,
                      paddingRight: 48,
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: 15,
                    }}
                    placeholder="Current Password"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrent}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity className="absolute right-4 top-4" onPress={() => setShowCurrent(prev => !prev)}>
                    <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View className="relative p-1">
                  <View className="absolute left-4 top-4 z-10">
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color={isDark ? colors.dark.textSecondary : colors.common.accent}
                    />
                  </View>
                  <TextInput
                    style={{
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      paddingVertical: 14,
                      paddingLeft: 48,
                      paddingRight: 48,
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: 15,
                    }}
                    placeholder="New Password"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity className="absolute right-4 top-4" onPress={() => setShowNew(prev => !prev)}>
                    <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View className="relative p-1">
                  <View className="absolute left-4 top-4 z-10">
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color={isDark ? colors.dark.textSecondary : colors.common.accent}
                    />
                  </View>
                  <TextInput
                    style={{
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#e5e7eb',
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      paddingVertical: 14,
                      paddingLeft: 48,
                      paddingRight: 48,
                      color: isDark ? '#f9fafb' : '#111827',
                      fontSize: 15,
                    }}
                    placeholder="Confirm New Password"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity className="absolute right-4 top-4" onPress={() => setShowConfirm(prev => !prev)}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  marginTop: 32,
                  borderRadius: 16,
                  backgroundColor: colors.common.primary,
                  paddingVertical: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  shadowColor: colors.common.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 3,
                }}
                onPress={handleChangePassword}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Poppins_600SemiBold' }}>Update Password</Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

