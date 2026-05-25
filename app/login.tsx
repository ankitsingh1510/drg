import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import OtpVerificationModal from '@/components/auth/OtpVerificationModal';
import { AppText } from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { useAuth, useLogin } from '@/context/AuthContext';
import { storageAPI } from '@/services/storage';
import { usersAPI } from '@/services/users';
import { storage } from '@/stores/mmkv';
import { decryptToken } from '@/util/helpers';
import { toast } from '@/util/toast';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const login = useLogin();
  const { isAuthenticated, isLoading, setIsLoading, setUser, setToken, setTargetLocation } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.logout === 'true') {
      setIsLoading(true);
      storage.clearAll();

      setUser(null);
      setToken(null);
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
    let valid = true;
    if (!identifier) {
      setIdentifierError('Email or Username is required');
      valid = false;
    } else {
      setIdentifierError('');
    }
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!valid) return;

    try {
      setIsLoading(true);
      // Authenticate and get token
      const response = await usersAPI.authenticateUser({ username: identifier.trim(), password });
      if (response && response.token) {
        const token = response.token;
        const tokenPayload = decryptToken(token);
        if (!tokenPayload) {
          throw new Error('Invalid token received');
        }
        const isMfaPending =
          tokenPayload.user_type === 'localUser' &&
          (tokenPayload.isMfaEnabled || tokenPayload.isMfaEnforced) &&
          !tokenPayload.isMfaVerified;
        if (!isMfaPending && tokenPayload.assignedApplications) {
          const isDrgUser = tokenPayload.assignedApplications.some((app: any) => app.name.toLowerCase() === 'drg');
          if (!isDrgUser) {
            setIsLoading(false);
            Alert.alert(
              'Access Denied',
              'You do not have access to this application. Please contact an administrator.'
            );
            return;
          }
        }
        if (tokenPayload.force_password_change === 1) {
          // Store token temporarily for the change password request
          storage.set('token', token);
          setIsLoading(false);
          toast.info('Password Update Required', 'Please update your password to continue.');
          router.replace({
            pathname: '/reset-password' as any,
            params: { userMasterId: tokenPayload.sub },
          });
        } else if (isMfaPending) {
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
          await completeLogin(identifier.trim(), password);
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  const completeLogin = async (usernameOrEmail: string, pwd: string) => {
    try {
      await login(usernameOrEmail, pwd);
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
      if (payload.assignedApplications) {
        const isDrgUser = payload.assignedApplications.some((app: any) => app.name.toLowerCase() === 'drg');
        if (!isDrgUser) {
          setIsLoading(false);
          Alert.alert('Access Denied', 'You do not have access to this application. Please contact an administrator.');
          return;
        }
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
      // Get upload config
      const config = await storageAPI.getUploadConfig();
      setTargetLocation(config?.data?.targetLocation || null);
      // Navigate to home
      setTimeout(() => router.replace('/home' as any), 0);
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
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color={colors.common.primary} />
        <AppText weight="medium" className="mt-4 text-lg text-slate-600 dark:text-gray-300">
          Securing Session...
        </AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#1E2D50" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-[#1E2D50]" edges={['top']}>
          <View className="flex-1 bg-[#1E2D50]">
            {/* Top Hero Section */}
            <View className="px-7 pb-10 pt-9">
              <AppText weight="extrabold" className="mb-2 text-3xl text-white">
                Welcome to DrG
              </AppText>
              <AppText weight="regular" className="text-base leading-6 text-[#A8BFDF]">
                Access patient reports &amp; clinical insights{'\n'}in one place
              </AppText>
            </View>

            {/* Login Form Card */}
            <ScrollView
              className="flex-1 rounded-t-3xl bg-white"
              contentContainerClassName="px-6 pt-8 pb-10"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Email Field */}
              <AppText weight="semibold" className="mb-1.5 text-sm text-gray-900">
                Email / Username
              </AppText>
              <View
                className={`rounded-xl border-[1.5px] bg-white ${identifierError ? 'border-red-500' : 'border-gray-200'} mb-1`}
              >
                <TextInput
                  className="px-3.5 py-3.5 font-outfit text-base text-gray-900"
                  placeholder="Enter your email or username"
                  placeholderTextColor="#9CA3AF"
                  value={identifier}
                  onChangeText={text => {
                    setIdentifier(text);
                    if (text) setIdentifierError('');
                  }}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {identifierError ? (
                <AppText className="mb-3 text-xs text-red-500">{identifierError}</AppText>
              ) : (
                <View className="mb-4" />
              )}

              {/* Password Field */}
              <AppText weight="semibold" className="mb-1.5 text-sm text-gray-900">
                Password
              </AppText>
              <View
                className={`flex-row items-center rounded-xl border-[1.5px] bg-white ${passwordError ? 'border-red-500' : 'border-gray-200'} mb-1`}
              >
                <TextInput
                  className="flex-1 px-3.5 py-3.5 font-outfit text-base text-gray-900"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={text => {
                    setPassword(text);
                    if (text) setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(s => !s)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  className="px-3"
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <AppText className="mb-2 text-xs text-red-500">{passwordError}</AppText>
              ) : (
                <View className="mb-2" />
              )}

              {/* Forgot Password */}
              <TouchableOpacity onPress={() => router.push('/forgot-password' as any)} className="mb-7 self-end">
                <AppText weight="semibold" className="text-sm" style={{ color: colors.common.info }}>
                  Forgot Password?
                </AppText>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={isLoading}
                className="mb-7 items-center rounded-xl bg-[#1E2D50] py-4"
              >
                <AppText weight="bold" className="text-base tracking-wide text-white">
                  {isLoading ? 'Processing...' : 'Log In'}
                </AppText>
              </TouchableOpacity>

              {/* Contact Support */}
              <View className="mb-6 items-center">
                <AppText weight="regular" className="text-sm text-gray-500">
                  Need help accessing your account?{' '}
                  <AppText
                    weight="semibold"
                    style={{ color: colors.common.info }}
                    onPress={() => Linking.openURL('mailto:product.support@1cell.ai')}
                  >
                    Contact Support
                  </AppText>
                </AppText>
              </View>
            </ScrollView>
            {/* Footer */}
            <View className="bg-white pb-10">
              <AppText weight="regular" className="text-center text-xs text-gray-400">
                Secure access for registered medical professionals only
              </AppText>
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
