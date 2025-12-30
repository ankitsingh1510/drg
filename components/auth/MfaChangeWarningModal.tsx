import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface MfaChangeWarningModalProps {
  visible: boolean;
  onContinue: () => void;
}

export default function MfaChangeWarningModal({ visible, onContinue }: MfaChangeWarningModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="mx-5 w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <Text className="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">Confirm 2FA Change</Text>
          <Text className="mb-6 text-base text-gray-600 dark:text-gray-400">
            You will be logged out. You will need to log in again for the changes to take effect.
          </Text>
          <TouchableOpacity
            onPress={onContinue}
            className="rounded-lg bg-blue-500 py-3 active:bg-blue-600 dark:bg-blue-600 dark:active:bg-blue-700"
          >
            <Text className="text-center font-semibold text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
