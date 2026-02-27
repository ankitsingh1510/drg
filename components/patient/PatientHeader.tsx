import React from 'react';
import { Platform, TextInput, View } from 'react-native';
import { useColorScheme } from 'nativewind';

interface PatientHeaderProps {
  totalCount: number;
  query: string;
  onSearch: (text: string) => void;
}

export function PatientHeader({ query, onSearch }: PatientHeaderProps) {
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
          <TextInput
            value={query}
            onChangeText={onSearch}
            className="flex-1 text-base font-medium text-gray-800 dark:text-gray-100"
            placeholder="Search patients, assay, physician…"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            style={{
              paddingVertical: Platform.OS === 'android' ? 12 : 10,
              includeFontPadding: false,
              lineHeight: Platform.OS === 'android' ? 20 : undefined,
            }}
            textAlignVertical="center"
          />
        </View>
      </View>
    </View>
  );
}
