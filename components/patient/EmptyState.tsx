import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  type: 'loading' | 'no-studies' | 'no-patients' | 'no-tests';
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === 'no-studies') {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <Text className="mb-2 text-lg font-semibold text-slate-900 dark:text-gray-100">No Studies Available</Text>
        <Text className="mb-4 text-center text-slate-600 dark:text-gray-400">
          You don&apos;t have access to any studies yet. Please contact your administrator.
        </Text>
      </View>
    );
  }

  if (type === 'no-patients') {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-center text-sm text-slate-500 dark:text-gray-400">
          No patients found matching your criteria.
        </Text>
      </View>
    );
  }

  if (type === 'no-tests') {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-center text-xl text-slate-500 dark:text-gray-400">No tests found.</Text>
      </View>
    );
  }

  return null;
}
