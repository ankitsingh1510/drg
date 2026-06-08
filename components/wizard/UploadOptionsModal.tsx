import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { FileText, Image } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

interface UploadOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onSelectFiles: () => void;
}

export function UploadOptionsModal({ visible, onClose, onSelectGallery, onSelectFiles }: UploadOptionsModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable
          className="w-full rounded-t-3xl bg-white p-6 pb-8 dark:bg-gray-800"
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View className="mb-2 items-center">
            <View className="h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>
          <Text className="mb-6 text-center text-xl font-outfit-bold text-gray-900 dark:text-gray-100">Upload Document</Text>

          {/* Options */}
          <View className="gap-3">
            {/* Gallery Option */}
            <TouchableOpacity
              onPress={() => {
                onSelectGallery();
                onClose();
              }}
              className="flex-row items-center rounded-xl border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
              activeOpacity={0.7}
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Image size={24} color={isDark ? '#60a5fa' : '#2563eb'} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-outfit-semibold text-gray-900 dark:text-gray-100">Gallery</Text>
                <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Select image from gallery</Text>
              </View>
            </TouchableOpacity>

            {/* Files Option */}
            <TouchableOpacity
              onPress={() => {
                onSelectFiles();
                onClose();
              }}
              className="flex-row items-center rounded-xl border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/50"
              activeOpacity={0.7}
            >
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <FileText size={24} color={isDark ? '#4ade80' : '#16a34a'} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-outfit-semibold text-gray-900 dark:text-gray-100">Files</Text>
                <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Select PDF or text file</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-6 items-center rounded-xl border-2 border-gray-300 bg-white py-3 dark:border-gray-600 dark:bg-gray-800"
            activeOpacity={0.7}
          >
            <Text className="text-base font-outfit-semibold text-gray-700 dark:text-gray-300">Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
