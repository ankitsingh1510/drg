import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { useLogout } from '@/context/AuthContext';
import { usersAPI } from '@/services/users';
import { storage } from '@/stores/mmkv';
import { toast } from '@/util/toast';

interface PasswordInputProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  isDark: boolean;
}

const PasswordInput = memo(
  ({ icon, placeholder, value, onChangeText, show, onToggleShow, isDark }: PasswordInputProps) => (
    <View className="mb-4 flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
      <Ionicons name={icon} size={20} color={isDark ? colors.dark.textSecondary : colors.common.accent} />
      <TextInput
        className="flex-1 py-3.5 pl-3 font-outfit text-lg text-gray-900 dark:text-gray-50"
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={onToggleShow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  )
);

function getErrorMessage(payload: any): string {
  const errorData = payload?.data || payload;
  if (errorData?.description) {
    return errorData.description.replace(/^[^:]*::\s*/, '');
  }
  return errorData?.message || payload?.message || 'Unable to update password. Please try again.';
}

function extractParam(value: string | string[] | undefined): string | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();
  const logout = useLogout();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userMasterId = useMemo(() => extractParam(params.userMasterId as any), [params.userMasterId]);

  // Toggle callbacks — stable references, avoids inline arrow re-allocation per render
  const toggleCurrent = useCallback(() => setShowCurrent(p => !p), []);
  const toggleNew = useCallback(() => setShowNew(p => !p), []);
  const toggleConfirm = useCallback(() => setShowConfirm(p => !p), []);

  const validateInputs = useCallback((): boolean => {
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
  }, [currentPassword, newPassword, confirmPassword, userMasterId]);

  const handleChangePassword = useCallback(async () => {
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
        storage.delete('token');
        toast.success('Password Updated', 'Please sign in with your new password.');
        logout();
        return;
      }

      Alert.alert('Update Failed', getErrorMessage(response));
    } catch (error: any) {
      Alert.alert('Update Failed', getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [validateInputs, userMasterId, currentPassword, newPassword, confirmPassword, logout]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900" edges={['top', 'left', 'right', 'bottom']}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={() => router.back()}>
            <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#1F2937'} strokeWidth={2.5} />
          </TouchableOpacity>
          <AppText weight="semibold" className="text-2xl text-[#0F2D37] dark:text-white">
            Change Password
          </AppText>
          <View className="w-8" />
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 px-6 pt-6">
              <View className="mb-8 items-center">
                <View
                  className="h-18 w-18 mb-4 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isDark ? 'rgba(218,165,33,0.15)' : 'rgba(218,165,33,0.12)',
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                  }}
                >
                  <Ionicons name="lock-closed" size={32} color={colors.common.primary} />
                </View>

                <AppText weight="bold" className="mb-1.5 text-2xl text-gray-900 dark:text-gray-50">
                  Update Your Password
                </AppText>
                <AppText className="text-center text-base text-gray-500 dark:text-gray-400">
                  {'Choose a strong password to keep\nyour account secure'}
                </AppText>
              </View>

              {/* ── Fields ── */}
              <PasswordInput
                icon="lock-closed-outline"
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                show={showCurrent}
                onToggleShow={toggleCurrent}
                isDark={isDark}
              />
              <PasswordInput
                icon="key-outline"
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                show={showNew}
                onToggleShow={toggleNew}
                isDark={isDark}
              />
              <PasswordInput
                icon="key-outline"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                show={showConfirm}
                onToggleShow={toggleConfirm}
                isDark={isDark}
              />

              <TouchableOpacity
                className="mt-8 flex-row items-center justify-center rounded-2xl bg-[#daa521] py-4"
                style={{
                  shadowColor: colors.common.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 3,
                  opacity: isSubmitting ? 0.8 : 1,
                }}
                onPress={handleChangePassword}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AppText weight="semibold" className="text-lg text-white">
                    Update Password
                  </AppText>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.back()} className="items-center py-2">
                <AppText className="mt-4 text-base" style={{ color: colors.common.info }}>
                  Go Back
                </AppText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
