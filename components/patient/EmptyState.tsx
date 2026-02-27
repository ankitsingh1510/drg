import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
  type: 'loading' | 'no-studies' | 'no-patients' | 'no-tests';
  onLogout?: () => void;
}

export function EmptyState({ type, onLogout }: EmptyStateProps) {
  if (type === 'no-studies') {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
        <Text className="mb-2 text-lg font-semibold text-slate-900 dark:text-gray-100">No Studies Available</Text>
        <Text className="mb-4 text-center text-slate-600 dark:text-gray-400">
          You don't have access to any studies yet. Please contact your administrator.
        </Text>
        {onLogout && (
          <TouchableOpacity className="rounded-lg bg-red-500 px-6 py-3 dark:bg-red-600" onPress={onLogout}>
            <Text className="text-base font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        )}
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
