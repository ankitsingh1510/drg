import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import type { ProfileField } from '@/types/users';

interface ProfileTextFieldProps {
  field: ProfileField;
  value: string;
  isReadOnly: boolean;
  isDarkMode: boolean;
  icon?: LucideIcon;
  onChangeText: (text: string) => void;
}

export default function ProfileTextField({
  field,
  value,
  isReadOnly,
  isDarkMode,
  icon: Icon,
  onChangeText,
}: ProfileTextFieldProps) {
  return (
    <View key={field.name} className="mb-5">
      <Text className="mb-2 font-outfit-medium text-base text-gray-600 dark:text-gray-400">
        {field.displayLabel}
        {field.required && <Text className="text-red-500"> *</Text>}
      </Text>
      {isReadOnly ? (
        <View className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          {Icon && (
            <View className="mr-3">
              <Icon size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} strokeWidth={1.5} />
            </View>
          )}
          <Text
            className={
              value
                ? 'flex-1 text-base text-gray-800 dark:text-gray-100'
                : 'flex-1 text-base text-gray-400 dark:text-gray-500'
            }
            style={{ minWidth: 0 }}
          >
            {value || 'NA'}
          </Text>
        </View>
      ) : (
        <View className="relative flex-row items-center rounded-lg border border-gray-300 bg-white px-4 dark:border-gray-600 dark:bg-gray-800">
          {Icon && (
            <View className="mr-3">
              <Icon size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} strokeWidth={1.5} />
            </View>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter ${field.displayLabel.toLowerCase()}`}
            className="flex-1 py-3 text-base text-gray-800 dark:text-gray-100"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            keyboardType={field.widgetType === 'email' ? 'email-address' : 'default'}
            editable={!field.readOnly}
            style={{ textAlignVertical: 'center' }}
          />
        </View>
      )}
    </View>
  );
}
