import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import IconNavBar from '../navigation/IconNavBar';

interface User {
  name: string;
  lname: string;
}

interface PatientHeaderProps {
  user: User | null;
  totalCount: number;
  query: string;
  onSearch: (text: string) => void;
  onLogout: () => void;
}

export function PatientHeader({ user, totalCount, query, onSearch, onLogout }: PatientHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className="bg-[#FDF5E6] px-5 pb-4 pt-4 dark:bg-gray-900"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#1f2937' : '#f1f5f9',
      }}
    >
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-3xl font-bold tracking-tighter text-gray-900 dark:text-white">Orders</Text>
          <View className="mt-1 flex-row items-center gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <Text className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {totalCount > 0 ? `${totalCount} active cases` : 'No cases assigned'}
            </Text>
          </View>
        </View>
        <IconNavBar />
      </View>

      {/* Search and Filter Row */}
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center rounded-full border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <TextInput
            value={query}
            onChangeText={onSearch}
            className="flex-1 text-base font-medium text-gray-800 dark:text-gray-100"
            placeholder="Search patient name..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          />
        </View>
      </View>
    </View>
  );
}
