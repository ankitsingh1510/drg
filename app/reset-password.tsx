import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: isDark ? colors.dark.background : '#FDF5E6' }}
          edges={['left', 'right', 'bottom']}
        >
          <View className="flex-1">
            <View className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#FDF5E6] to-transparent dark:from-gray-900" />
            <View className="absolute left-6 top-[25%]">
              <Text className="text-3xl font-extrabold tracking-tight text-gray-800 shadow-lg dark:text-gray-100">
                Update Password
              </Text>
              <Text className="mt-1 text-base font-medium text-gray-600 shadow-lg dark:text-gray-100">
                Required before you continue
              </Text>
            </View>
          </View>

          <View className="flex-1 rounded-t-[40px] bg-[#FDF5E6] px-8 pt-0 dark:bg-gray-900">
            <View className="mb-8 items-center">
              <Text className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Secure Your Account</Text>
              <Text className="mt-1 text-base text-gray-500 dark:text-gray-400">
                Enter your current and new password
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
                  className="rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-black shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                  className="rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-black shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                  className="rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-black shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
              className="mt-8 flex-row items-center justify-center rounded-2xl bg-[#2563EB] py-4 shadow-lg"
              onPress={handleChangePassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">Update Password</Text>
              )}
            </TouchableOpacity>

            {isFromSettings ? (
              <TouchableOpacity className="mt-5 items-center" onPress={handleBackToSettings}>
                <Text className="text-base font-medium text-gray-500 dark:text-gray-400">Back to settings</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="mt-5 items-center" onPress={handleBackToLogin}>
                <Text className="text-base font-medium text-gray-500 dark:text-gray-400">Back to login</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
