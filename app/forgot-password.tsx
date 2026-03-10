import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { usersAPI } from '@/services/users';
import { toast } from '@/util/toast';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendResetLink = async () => {
    if (!email || !isValidEmail) {
      toast.error('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);

      const response = await usersAPI.sendResetPasswordLink(email);

      if (response) {
        setSubmitted(true);
        toast.success('Success', 'Password reset link has been sent to your email');
        // Auto navigate after 2 seconds
        // setTimeout(() => {
        //   handleBackToLogin();
        // }, 2000);
      } else {
        throw new Error('Failed to send reset link');
      }
    } catch (error: any) {
      setIsLoading(false);
      toast.error('Error', error.message || 'Failed to send reset link. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    setEmail('');
    setSubmitted(false);
    setIsLoading(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDark ? colors.dark.background : '#FDF5E6',
          }}
          edges={['left', 'right', 'bottom']}
        >
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4">
              <TouchableOpacity onPress={handleBackToLogin} className="rounded-full p-2">
                <Ionicons name="arrow-back" size={24} color={isDark ? '#F3F4F6' : '#1F2937'} />
              </TouchableOpacity>
              <Text
                className="text-lg font-semibold"
                style={{
                  color: isDark ? '#F3F4F6' : '#1F2937',
                }}
              >
                Reset Password
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <View className="flex-1 justify-center px-6 py-8">
              {submitted ? (
                // Success State
                <View className="flex-1 items-center justify-center">
                  <View
                    className="mb-6 items-center justify-center rounded-full p-6"
                    style={{ backgroundColor: colors.common.primary + '20' }}
                  >
                    <Ionicons name="checkmark-circle" size={64} color={colors.common.primary} />
                  </View>
                  <Text
                    className="text-center text-2xl font-bold"
                    style={{
                      color: isDark ? '#F3F4F6' : '#1F2937',
                    }}
                  >
                    Check Your Email
                  </Text>
                  <Text
                    className="mt-4 text-center text-base leading-6"
                    style={{
                      color: isDark ? '#D1D5DB' : '#6B7280',
                    }}
                  >
                    We&apos;ve sent a password reset link to{'\n'}
                    <Text className="font-semibold">{email}</Text>
                  </Text>
                  <Text
                    className="mt-6 text-center text-sm leading-6"
                    style={{
                      color: isDark ? '#D1D5DB' : '#6B7280',
                    }}
                  >
                    Click the link in the email to reset your password.
                  </Text>
                  <Text
                    className="mt-6 text-center text-xs"
                    style={{
                      color: isDark ? '#9CA3AF' : '#9CA3AF',
                    }}
                  >
                    If you don&apos;t see the email, check your spam or junk folder.
                  </Text>
                </View>
              ) : (
                // Input State
                <View>
                  <View className="mb-8 items-center">
                    <View
                      className="mb-4 items-center justify-center rounded-full p-4"
                      style={{ backgroundColor: colors.common.primary + '15' }}
                    >
                      <Ionicons name="key-outline" size={40} color={colors.common.primary} />
                    </View>
                    <Text
                      className="text-center text-2xl font-bold"
                      style={{
                        color: isDark ? '#F3F4F6' : '#1F2937',
                      }}
                    >
                      Password Reset
                    </Text>
                    <Text
                      className="mt-3 text-center text-base"
                      style={{
                        color: isDark ? '#D1D5DB' : '#6B7280',
                      }}
                    >
                      Enter your email address and we&apos;ll send you a link to reset your password.
                    </Text>
                  </View>

                  {/* Email Input */}
                  <View className="relative mb-8 mt-8">
                    <Text
                      className="mb-2 text-sm font-medium"
                      style={{
                        color: isDark ? '#F3F4F6' : '#1F2937',
                      }}
                    >
                      Email Address
                    </Text>
                    <View className="flex-row items-center rounded-xl border border-gray-200 bg-white px-4 dark:border-gray-600 dark:bg-gray-700">
                      <Ionicons name="mail-outline" size={20} color={isDark ? '#9CA3AF' : '#9CA3AF'} />
                      <TextInput
                        style={{
                          flex: 1,
                          paddingVertical: 12,
                          paddingHorizontal: 12,
                          color: isDark ? 'white' : 'black',
                        }}
                        placeholder="your.email@example.com"
                        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                        autoFocus
                      />
                    </View>
                  </View>

                  {/* Send Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSendResetLink}
                    disabled={isLoading || !isValidEmail}
                    className={`overflow-hidden rounded-xl py-4 ${isLoading || !isValidEmail ? 'opacity-60' : ''}`}
                    style={{
                      backgroundColor: colors.common.primary,
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      {isLoading ? (
                        <>
                          <ActivityIndicator size="small" color="#FFFFFF" />
                          <Text className="ml-2 text-center font-semibold text-white">Sending...</Text>
                        </>
                      ) : (
                        <Text className="text-center font-semibold text-white">Send Reset Link</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Back to Login */}
                  <TouchableOpacity onPress={handleBackToLogin} className="mt-4">
                    <Text
                      className="text-center text-sm font-medium"
                      style={{
                        color: colors.common.primary,
                      }}
                    >
                      Back to Login
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
