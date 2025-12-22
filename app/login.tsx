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
import { colors } from '@/constants/colors';
import { useAuth, useLogin } from '@/context/AuthContext';
import { storage } from '@/stores/mmkv';

export default function LoginScreen() {
  const [email, setEmail] = useState(__DEV__ ? 'rohit.chavan@1cell.ai' : '');
  const [password, setPassword] = useState(__DEV__ ? 'Indx@12345' : '');
  const [showPassword, setShowPassword] = useState(false);
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
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
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
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
