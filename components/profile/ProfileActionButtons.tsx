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
      <View className="mb-6 items-center">
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.8}
          className="h-12 flex-row items-center justify-center gap-2 rounded-full bg-blue-500 px-10 shadow-sm active:bg-blue-600 dark:bg-blue-600 dark:active:bg-blue-700"
        >
          <Edit2 size={18} color="#ffffff" strokeWidth={2.5} />
          <Text className="text-base font-outfit-bold text-white">Edit Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mb-6 flex-row justify-center gap-4">
      <TouchableOpacity
        onPress={onCancel}
        disabled={isLoading}
        activeOpacity={0.7}
        className="h-12 max-w-[160px] flex-1 flex-row items-center justify-center gap-2 rounded-full border border-gray-200 bg-white shadow-sm active:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:active:bg-gray-700"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isDarkMode ? '#e5e7eb' : '#374151'} />
        ) : (
          <>
            <X size={18} color={isDarkMode ? '#e5e7eb' : '#374151'} strokeWidth={2.5} />
            <Text className="text-base font-outfit-bold text-gray-700 dark:text-gray-200">Cancel</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        disabled={isLoading}
        activeOpacity={0.8}
        className="h-12 max-w-[160px] flex-1 flex-row items-center justify-center gap-2 rounded-full bg-blue-500 shadow-sm active:bg-blue-600 dark:bg-blue-600 dark:active:bg-blue-700"
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Save size={18} color="#ffffff" strokeWidth={2.5} />
            <Text className="text-base font-outfit-bold text-white">Save</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
