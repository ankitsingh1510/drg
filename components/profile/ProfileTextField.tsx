import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { ProfileField } from '@/types/users';

interface ProfileTextFieldProps {
  field: ProfileField;
  value: string;
  isReadOnly: boolean;
  isDarkMode: boolean;
  onChangeText: (text: string) => void;
}

export default function ProfileTextField({
  field,
  value,
  isReadOnly,
  isDarkMode,
  onChangeText,
}: ProfileTextFieldProps) {
  return (
    <View key={field.name} className="mb-5">
      <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        {field.displayLabel}
        {field.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {isReadOnly ? (
        <View className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <Text
            className={
              value ? 'text-base text-gray-800 dark:text-gray-100' : 'text-base text-gray-400 dark:text-gray-500'
            }
          >
            {value || 'NA'}
          </Text>
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${field.displayLabel.toLowerCase()}`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
          keyboardType={field.widgetType === 'email' ? 'email-address' : 'default'}
          editable={!field.readOnly}
        />
      )}
    </View>
  );
}
