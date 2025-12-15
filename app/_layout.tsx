// Not Recommended: Using @ts-nocheck disables all TypeScript checks in this file,
// But it's used here to bypass type errors from `defaultProps` assignments which is deprecated.
// @ts-nocheck
import React from 'react';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { startNetworkLogging } from 'react-native-network-logger';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import NetworkLoggers from '@/components/NetworkLoggers';
import { AuthProvider } from '@/context/AuthContext';
import NetworkChecker from '@/hooks/NetworkChecker';
import '../global.css';

export default function RootLayout() {
  startNetworkLogging();
  const [showLogger, setShowLogger] = useState(false);
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  if (!loaded) return null;

  if (Text.defaultProps == null) Text.defaultProps = {};
  Text.defaultProps.style = { fontFamily: 'Poppins_400Regular' };

  if (TextInput.defaultProps == null) TextInput.defaultProps = {};
  TextInput.defaultProps.style = { fontFamily: 'Poppins_400Regular' };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <StatusBar style="dark" backgroundColor="#FDF5E6" />
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <Toast position="bottom" />
          <NetworkChecker />
          <NetworkLoggers />
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
