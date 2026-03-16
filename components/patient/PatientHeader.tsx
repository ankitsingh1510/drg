import React from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface PatientHeaderProps {
  totalCount: number;
  query: string;
  onSearch: (text: string) => void;
}

export function PatientHeader({ totalCount, query, onSearch }: PatientHeaderProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className="bg-[#FDF5E6] px-5 pb-3 pt-3 dark:bg-gray-900"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#1f2937' : '#f1f5f9',
      }}
    >
      <View className="flex-row items-center">
        <View className="h-12 flex-1 flex-row items-center rounded-full border border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
          <View className="items-center justify-center">
            <Search size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
          </View>
          <TextInput
            value={query}
            onChangeText={onSearch}
            className="ml-2 flex-1 text-base font-medium text-gray-800 dark:text-gray-100"
            placeholder="Search reports, assay, physician…"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{
              height: 48,
              paddingTop: 0,
              paddingBottom: Platform.OS === 'ios' ? 4 : 0,
              includeFontPadding: false,
            }}
            textAlignVertical="center"
          />
        </View>
      </View>
      <View className="mt-2 flex-row items-center justify-between px-1">
        <Text className="text-xs font-bold uppercase tracking-widest text-gray-400">{totalCount} Total Reports</Text>
      </View>
    </View>
  );
}
