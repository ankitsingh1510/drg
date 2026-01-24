import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import OtpVerificationModal from '@/components/auth/OtpVerificationModal';
import { colors } from '@/constants/colors';
import { useAuth, useLogin } from '@/context/AuthContext';
import { storageAPI } from '@/services/storage';
import { studyAPI } from '@/services/study';
import { usersAPI } from '@/services/users';
import { storage } from '@/stores/mmkv';
import { decryptToken } from '@/util/helpers';
import { toast } from '@/util/toast';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const login = useLogin();
  const { isAuthenticated, isLoading, setIsLoading, setUser, setToken, setUsersStudyList, setTargetLocation } =
    useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.logout === 'true') {
      setIsLoading(true);
      storage.clearAll();

      setUser(null);
      setToken(null);
      setUsersStudyList([]);
      setTargetLocation(null);

      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/' as any);
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  }, [params.logout]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      // Authenticate and get token
      const response = await usersAPI.authenticateUser({ username: email, password });
      if (response && response.token) {
        const token = response.token;
        const tokenPayload = decryptToken(token);
        if (!tokenPayload) {
          throw new Error('Invalid token received');
        }
        // Check if MFA is enabled and not verified
        if (
          tokenPayload.user_type === 'localUser' &&
          (tokenPayload.isMfaEnabled || tokenPayload.isMfaEnforced) &&
          !tokenPayload.isMfaVerified
        ) {
          // Store token temporarily in storage for API calls
          storage.set('token', token);
          const otpResponse = await usersAPI.sendMfaOtp('email');
          if (otpResponse?.statusCode === 200 || otpResponse?.statusCode === 201) {
            toast.success('OTP Sent', 'Please check your email for the verification code');
          }
          setIsLoading(false);
          setShowMfaModal(true);
        } else {
          // No MFA required, proceed with normal login
          await completeLogin(email, password);
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  const completeLogin = async (username: string, pwd: string) => {
    try {
      await login(username, pwd);
    } catch (error: any) {
      throw error;
    }
  };

  const completeMfaLogin = async (verifiedToken: string) => {
    try {
      const payload = decryptToken(verifiedToken);
      if (!payload) {
        throw new Error('Invalid token');
      }
      setToken(verifiedToken);
      // Fetch user details using the verified token
      const userDetails = await usersAPI.getUserDetail({ userMasterId: payload.sub });
      const userFields = userDetails.data.userMasterModel.fields;

      const nameField = userFields.find((x: any) => x.name === 'name')?.value;
      const lnameField = userFields.find((x: any) => x.name === 'lname')?.value;
      const emailField = userFields.find((x: any) => x.name === 'email')?.value;

      const userData = {
        name: nameField,
        lname: lnameField,
        email: emailField,
        sub: payload.sub,
        username: payload.username,
        role_id: payload.role_id,
      };

      setUser(userData);
      // Fetch study list
      const studyList = await studyAPI.getStudyList();
      const studyIds = studyList?.data?.map((x: any) => x.studyId) || [];
      setUsersStudyList(studyIds);
      // Get upload config
      const config = await storageAPI.getUploadConfig();
      setTargetLocation(config?.data?.targetLocation || null);
      // Navigate to landing page
      router.replace('/landing' as any);
    } catch (error) {
      console.error('Error completing MFA login:', error);
      throw error;
    }
  };

  const handleOtpVerified = async (verifiedToken: string) => {
    try {
      // Store the verified token
      storage.set('token', verifiedToken);
      setShowMfaModal(false);
      // Complete login using the verified token
      await completeMfaLogin(verifiedToken);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Failed to complete login');
    }
  };

  const handleOtpModalClose = () => {
    setShowMfaModal(false);
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#FDF5E6] dark:bg-gray-900"
        style={{ flex: 1, backgroundColor: isDark ? colors.dark.background : '#FDF5E6' }}
      >
        <ActivityIndicator size="large" color={colors.common.primary} />
        <Text className="mt-4 text-lg font-medium text-slate-600 dark:text-gray-300">Securing Session...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: isDark ? colors.dark.background : '#FDF5E6' }}
          edges={['left', 'right', 'bottom']}
        >
          <View className="flex-1">
            {/* Top Hero Section */}
            <View className="h-[40%] w-full overflow-hidden">
              <ExpoImage
                source={{
                  uri: 'https://images.unsplash.com/photo-1614935151651-0dec300bb4bd?q=80&w=1000&auto=format&fit=crop',
                }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={500}
              />
              <View className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FDF5E6] to-transparent dark:from-gray-900" />
              <View className="absolute left-6 top-[25%]">
                <Text className="text-4xl font-extrabold tracking-tight text-white shadow-lg">Dr. G</Text>
                <Text className="mt-1 text-lg font-medium text-white/90 shadow-md">Intelligent Clinical Assistant</Text>
              </View>
            </View>

            {/* Login Form Container */}
            <View className="-mt-12 flex-1 rounded-t-[40px] bg-[#FDF5E6] px-8 pt-8 dark:bg-gray-900">
              <View className="mb-8 items-center">
                <View className="mb-4 h-20 w-20 overflow-hidden rounded-2xl bg-white p-2 shadow-sm dark:bg-gray-800">
                  <ExpoImage
                    source={require('@/assets/images/DrG-logo.png')}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                  />
                </View>
                <Text className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Welcome Back</Text>
                <Text className="mt-1 text-base text-gray-500 dark:text-gray-400">
                  Please enter your details to sign in
                </Text>
              </View>

              <View className="space-y-5">
                {/* Email Input */}
                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={isDark ? colors.dark.textSecondary : colors.common.accent}
                    />
                  </View>
                  <TextInput
                    className="rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-black shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Email Address"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Password Input */}
                <View className="relative mt-5">
                  <View className="absolute left-4 top-4 z-10">
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={isDark ? colors.dark.textSecondary : colors.common.accent}
                    />
                  </View>
                  <TextInput
                    className="rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-14 text-black shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Password"
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(s => !s)}
                    className="absolute right-4 top-4 z-10"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={isDark ? colors.dark.textTertiary : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="mt-10 overflow-hidden rounded-2xl shadow-xl shadow-blue-500/30"
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <View className="items-center py-4" style={{ backgroundColor: colors.common.primary }}>
                    <Text className="text-lg font-bold uppercase tracking-wider text-white">
                      {isLoading ? 'Processing...' : 'Login Now'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Footer Quote or Branding */}
                <View className="mb-10 mt-auto items-center">
                  <Text className="text-xs text-gray-400 dark:text-gray-600">
                    Powered by 1Cell.Ai • Precision Genomics
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <OtpVerificationModal
            visible={showMfaModal}
            onClose={handleOtpModalClose}
            onVerifySuccess={handleOtpVerified}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
