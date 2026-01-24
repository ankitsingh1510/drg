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
  filter: string;
  onSearch: (text: string) => void;
  onFilterPress: () => void;
  onLogout: () => void;
}

export function PatientHeader({
  user,
  totalCount,
  query,
  filter,
  onSearch,
  onFilterPress,
  onLogout,
}: PatientHeaderProps) {
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
        <TouchableOpacity
          onPress={onFilterPress}
          activeOpacity={0.7}
          className={`h-12 w-12 items-center justify-center rounded-full border shadow-sm ${
            filter !== 'All'
              ? 'border-blue-500 bg-blue-500'
              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          }`}
        >
          <Text
            style={{ fontSize: 20 }}
            className={filter !== 'All' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}
          >
            {filter !== 'All' ? '✓' : '≡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* active filters chips */}
      {(filter !== 'All' || query.trim()) && (
        <View className="mt-4 flex-row flex-wrap gap-2">
          {filter !== 'All' && (
            <View className="rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-900/30">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Status: {filter}
              </Text>
            </View>
          )}
          {query.trim() && (
            <View className="rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-800">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                "{query}"
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
