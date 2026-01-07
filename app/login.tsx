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
import { useLocalSearchParams, useRouter } from 'expo-router';
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
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-700">
        <Text className="text-lg text-gray-600 dark:text-gray-400">
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="large" color={colors.common.primary} />
            <Text className="mt-2 text-lg text-slate-600 dark:text-gray-300">Loading</Text>
          </View>
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="bg-[#FDF5E6] dark:bg-gray-900" style={{ flex: 1, padding: 22 }}>
          <View className="flex-1 justify-center">
            <View className="mb-10">
              <Text className="mb-2 text-2xl font-extrabold text-gray-900 dark:text-gray-100">{`Welcome back! \nGlad to see you, Again!`}</Text>
            </View>

            <View className="mb-6 space-y-4">
              <View className="mb-4">
                <TextInput
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? colors.dark.textTertiary : '#9CA3AF'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View>
                <View className="relative">
                  <TextInput
                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your password"
                    placeholderTextColor={isDark ? colors.dark.textTertiary : '#9CA3AF'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-3 z-10 h-8 w-8 items-center justify-center"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={{ fontSize: 16 }}>{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              className="items-center rounded-lg py-4"
              style={{ backgroundColor: colors.common.primary }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-base font-semibold text-white">{isLoading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
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
