import React from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'jotai';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <Provider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </Provider>
  );
}
