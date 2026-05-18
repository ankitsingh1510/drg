import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from 'nativewind';

type NotificationPermissionModalProps = {
  visible: boolean;
  onClose: (performAction: boolean) => void;
};

export default function NotificationPermissionModal({ visible, onClose }: NotificationPermissionModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onClose(false)}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onClose(false)}
        className="flex-1 items-center justify-center bg-black/50 p-5"
      >
        <TouchableWithoutFeedback>
          <View className="mx-5 w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <View className="mb-4 items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Ionicons name="notifications-outline" size={32} color={isDark ? '#60A5FA' : '#3B82F6'} />
              </View>
            </View>

            <Text className="mb-2 text-center text-2xl font-outfit-semibold text-gray-800 dark:text-gray-100">
              Get notified when your report is ready
            </Text>
            <Text className="mb-6 text-center text-base text-gray-600 dark:text-gray-400">
              Analysis can take a few minutes.{'\n'}
              We'll notify you as soon as your report is analyzed.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => onClose(false)}
                className="flex-1 rounded-lg border border-gray-300 bg-white py-3 dark:border-gray-600 dark:bg-gray-700"
              >
                <Text className="text-center font-outfit-semibold text-gray-700 dark:text-gray-200">Not Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onClose(true)}
                className="flex-1 rounded-lg bg-blue-500 py-3 dark:bg-blue-600"
              >
                <Text className="text-center font-outfit-semibold text-white">Enable Notifications</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}
