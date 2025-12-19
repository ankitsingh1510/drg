import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';
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
    <>
      <View
        className={`border-b border-gray-200 bg-white px-4 pb-4 dark:border-gray-700 dark:bg-gray-800 ${Platform.OS === 'ios' ? 'pt-2' : 'pt-2'}`}
        style={{ backgroundColor: isDark ? colors.dark.cardBackground : colors.light.background }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 dark:text-gray-100">Order List</Text>
            {user && (
              <Text className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                Welcome, {user.name} {user.lname}
              </Text>
            )}
            {totalCount > 0 && (
              <Text className="mt-1 text-xs text-slate-400 dark:text-gray-500">{totalCount} total cases</Text>
            )}
          </View>
          <IconNavBar />
          {/* <View className="flex flex-row items-center justify-center">
              <Text className="text-2xl text-slate-700">Home</Text>
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)} className="px-2 py-2">
                <Text className="text-2xl text-slate-700">⋮</Text>
              </TouchableOpacity>
            </View> */}
        </View>

        {/* Search and Filter */}
        <View className="flex-row items-center gap-1">
          <TextInput
            value={query}
            onChangeText={onSearch}
            className="flex-1 rounded-lg border border-blue-100 bg-white px-4 py-3 text-slate-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Search by patient name"
            placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textSecondary}
          />
          <TouchableOpacity
            className="rounded-lg border border-blue-200 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-700"
            onPress={onFilterPress}
          >
            <Text className="text-sm font-medium text-blue-700 dark:text-blue-400">Filter ▾</Text>
          </TouchableOpacity>
        </View>

        {(filter !== 'All' || query.trim()) && (
          <View className="mt-2 flex-row items-center space-x-4">
            {filter !== 'All' && (
              <Text className="text-sm text-slate-600 dark:text-gray-400">
                Filter: <Text className="font-medium">{filter}</Text>
              </Text>
            )}
            {query.trim() && (
              <Text className="text-sm text-slate-600 dark:text-gray-400">
                Search: <Text className="font-medium">"{query}"</Text>
              </Text>
            )}
          </View>
        )}
      </View>

      {showMenu && (
        <Modal transparent visible={showMenu} animationType="fade" onRequestClose={() => setShowMenu(false)}>
          <Pressable className="flex-1" onPress={() => setShowMenu(false)}>
            <View className="absolute right-4 top-24 z-50 w-32 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
              <TouchableOpacity
                className="rounded-lg px-4 py-3"
                onPress={() => {
                  setShowMenu(false);
                  onLogout();
                }}
              >
                <Text className="text-sm font-semibold text-red-500 dark:text-red-400">Logout</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
