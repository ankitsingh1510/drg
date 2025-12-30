import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Edit2, Save, X } from 'lucide-react-native';

interface ProfileActionButtonsProps {
  isEditing: boolean;
  isLoading: boolean;
  isDarkMode: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileActionButtons({
  isEditing,
  isLoading,
  isDarkMode,
  onEdit,
  onSave,
  onCancel,
}: ProfileActionButtonsProps) {
  if (!isEditing) {
    return (
      <View className="mb-6 flex-row gap-3">
        <TouchableOpacity
          onPress={onEdit}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-blue-500 py-3 active:bg-blue-600 dark:bg-blue-600 dark:active:bg-blue-700"
        >
          <Edit2 size={20} color="#ffffff" />
          <Text className="font-semibold text-white">Edit Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-6 flex-row gap-3">
      <TouchableOpacity
        onPress={onCancel}
        disabled={isLoading}
        className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-3 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:active:bg-gray-600"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isDarkMode ? '#e5e7eb' : '#374151'} />
        ) : (
          <>
            <X size={20} color={isDarkMode ? '#e5e7eb' : '#374151'} />
            <Text className="font-semibold text-gray-700 dark:text-gray-200">Cancel</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        disabled={isLoading}
        className="flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-blue-500 py-3 active:bg-blue-600 dark:bg-blue-600 dark:active:bg-blue-700"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Save size={20} color="#ffffff" />
            <Text className="font-semibold text-white">Save</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
