import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useLogin } from '@/context/AuthContext';
import '../global.css';

export default function LoginScreen() {
  const [email, setEmail] = useState(__DEV__ ? 'rohit.chavan@1cell.ai' : '');
  const [password, setPassword] = useState(__DEV__ ? 'Indx@12345' : '');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // router.replace('/patients' as any);
      console.log('User is authenticated, navigating to landing page');
      router.replace('/landing' as any);
    }
  }, [isAuthenticated]);

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
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-600">
          <View className="absolute inset-0 items-center justify-center bg-gray-50/80">
            <ActivityIndicator size="large" color="#daa521" />
            <Text className="mt-2 text-lg text-slate-600">Loading</Text>
          </View>
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 22 }}>
      <View className="flex-1 justify-center">
        <View className="mb-10">
          <Text className="mb-2 text-2xl font-extrabold text-gray-900">Welcome back! Glad</Text>
          <Text className="text-2xl font-extrabold text-gray-900">to see you, Again!</Text>
        </View>

        <View className="mb-6 space-y-4">
          <View className="mb-4">
            <TextInput
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-black"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
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
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-black"
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
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

        {/* Login button styled to match the gold/orange button in the screenshot. Forgot password removed as requested. */}
        <TouchableOpacity
          className="items-center rounded-lg bg-[#daa521] py-4"
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text className="text-base font-semibold text-white">{isLoading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
