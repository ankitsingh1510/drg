import React from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'jotai';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <Provider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toast position="bottom" />
      </AuthProvider>
    </Provider>
  );
}
