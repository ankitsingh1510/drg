import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import type { ProfileField } from '@/types/users';

interface ProfileDropdownFieldProps {
  field: ProfileField;
  value: string;
  isReadOnly: boolean;
  isDarkMode: boolean;
  onPress: () => void;
}

export default function ProfileDropdownField({
  field,
  value,
  isReadOnly,
  isDarkMode,
  onPress,
}: ProfileDropdownFieldProps) {
  const isDisabled = field.name === 'organization' || field.name === 'userType';

  return (
    <View key={field.name} className="mb-5">
      <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        {field.displayLabel}
        {field.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {isReadOnly || isDisabled ? (
        <View className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <Text className="text-base text-gray-800 dark:text-gray-100">{value || 'Not selected'}</Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          className="flex-row items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 dark:border-gray-600 dark:bg-gray-800"
        >
          <Text className="text-base text-gray-800 dark:text-gray-100">{value || 'Select...'}</Text>
          <ChevronDown size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      )}
    </View>
  );
}
