import React from 'react';
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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '@/context/AuthContext';
import NetworkChecker from '@/hooks/NetworkChecker';
import '../global.css';

export default function RootLayout() {
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
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
