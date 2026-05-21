import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { usersAPI } from '@/services/users';
import { toast } from '@/util/toast';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#1E2D50" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-[#1E2D50]" edges={['top']}>
          <View className="flex-1 bg-[#1E2D50]">
            <View className="px-7 pb-10 pt-4">
              <TouchableOpacity onPress={handleBackToLogin} className="mb-5 self-start rounded-full p-1">
                <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text className="mb-2 font-outfit-extrabold text-3xl text-white">
                {submitted ? 'Check Your Email' : 'Reset Password'}
              </Text>
              <Text className="font-outfit text-base leading-6 text-[#A8BFDF]">
                {submitted ? `We've sent a reset link to ${email}` : "Enter your email and we'll send you a reset link"}
              </Text>
            </View>

            <View className="flex-1 rounded-t-3xl bg-white px-6 pb-10 pt-8">
              {submitted ? (
                <View className="flex-1 items-center justify-center">
                  <View className="mb-6 items-center justify-center rounded-full bg-[#1E2D50]/10 p-6">
                    <Ionicons name="checkmark-circle" size={64} color="#1E2D50" />
                  </View>

                  <Text className="mb-3 font-outfit-bold text-2xl text-gray-900">Email Sent!</Text>
                  <Text className="mb-1 text-center font-outfit text-sm leading-6 text-gray-500">
                    Click the link in the email to reset your password.
                  </Text>
                  <Text className="mb-10 text-center font-outfit text-xs text-gray-400">
                    If you don't see it, check your spam or junk folder.
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleBackToLogin}
                    className="w-full items-center rounded-xl bg-[#1E2D50] py-4"
                  >
                    <Text className="font-outfit-bold text-base tracking-wide text-white">Back to Log In</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text className="mb-1.5 font-outfit-semibold text-sm text-gray-900">Email Address</Text>
                  <View className="mb-1 rounded-xl border-[1.5px] border-gray-200 bg-white">
                    <TextInput
                      className="px-3.5 py-3.5 font-outfit text-base text-gray-900"
                      placeholder="Enter your email id"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      autoFocus
                    />
                  </View>
                  <View className="mb-8" />

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSendResetLink}
                    disabled={isLoading || !isValidEmail}
                    className={`mb-4 items-center rounded-xl bg-[#1E2D50] py-4 ${isLoading || !isValidEmail ? 'opacity-50' : ''}`}
                  >
                    {isLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text className="ml-2 font-outfit-bold text-base tracking-wide text-white">Sending...</Text>
                      </View>
                    ) : (
                      <Text className="font-outfit-bold text-base tracking-wide text-white">{'Send Reset Link'}</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleBackToLogin} className="items-center py-2">
                    <Text className="font-outfit-semibold text-sm" style={{ color: colors.common.info }}>
                      Back to Log In
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
