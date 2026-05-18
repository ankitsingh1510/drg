import React from 'react';
import { Switch, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import type { ProfileField } from '@/types/users';

interface ProfileCheckboxFieldProps {
  field: ProfileField;
  isChecked: boolean;
  isReadOnly: boolean;
  isDarkMode: boolean;
  onValueChange: (enabled: boolean) => void;
}

export default function ProfileCheckboxField({
  field,
  isChecked,
  isReadOnly,
  isDarkMode,
  onValueChange,
}: ProfileCheckboxFieldProps) {
  return (
    <View key={field.name} className="mb-5 flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-sm font-outfit-medium text-gray-800 dark:text-gray-100">{field.displayLabel}</Text>
        {field.description && (
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">{field.description}</Text>
        )}
      </View>
      <Switch
        value={isChecked}
        onValueChange={onValueChange}
        disabled={isReadOnly}
        trackColor={{
          false: colors.light.border,
          true: colors.common.info,
        }}
        thumbColor={isDarkMode ? '#1e40af' : '#f3f4f6'}
      />
    </View>
  );
}
