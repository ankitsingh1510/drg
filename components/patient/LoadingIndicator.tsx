import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

interface LoadingIndicatorProps {
  type: 'full-screen' | 'footer' | 'list-center';
  message?: string;
}

export function LoadingIndicator({ type, message = 'Loading...' }: LoadingIndicatorProps) {
  if (type === 'full-screen') {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={colors.common.primary} />
        <Text className="mt-2 text-lg text-slate-600">{message}</Text>
      </View>
    );
  }

  if (type === 'list-center') {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={colors.common.primary} />
        <Text className="mt-2 text-lg text-slate-600">{message}</Text>
      </View>
    );
  }

  if (type === 'footer') {
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={colors.common.primary} />
      </View>
    );
  }

  return null;
}
