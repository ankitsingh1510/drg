import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { toast } from '@/util/toast';

interface ESignatureModalProps {
  visible: boolean;
  username: string;
  onCancel: () => void;
  onConfirm: (password: string, changeReasonDetail: string) => void;
}

export default function ESignatureModal({ visible, username, onCancel, onConfirm }: ESignatureModalProps) {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [password, setPassword] = useState('');
  const [changeReasonDetail, setChangeReasonDetail] = useState('');

  const isValid = () => {
    return username.trim() !== '' && password.trim() !== '' && changeReasonDetail.trim().length >= 6;
  };

  const handleConfirm = () => {
    if (!username || !password || !changeReasonDetail) {
      toast.error('Required Fields', 'Please fill all eSignature fields');
      return;
    }

    if (changeReasonDetail.length < 6) {
      toast.error('Invalid Input', 'Reason must be at least 6 characters long');
      return;
    }

    onConfirm(password, changeReasonDetail);
    setPassword('');
    setChangeReasonDetail('');
  };

  const handleCancel = () => {
    setPassword('');
    setChangeReasonDetail('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={handleCancel}>
        <Pressable className="mx-5 w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <Text className="text-semibold mb-4 text-gray-600 dark:text-gray-400">
            Please provide your credentials to confirm this profile update
          </Text>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Username <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={username}
              placeholder="Enter username"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              autoCapitalize="none"
              editable={false}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Password <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
            />
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Reason for Change <Text className="text-red-500">*</Text>
              <Text className="text-xs text-gray-500"> (min. 6 characters)</Text>
            </Text>
            <TextInput
              value={changeReasonDetail}
              onChangeText={setChangeReasonDetail}
              placeholder="Enter reason for this update"
              multiline
              numberOfLines={3}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
              textAlignVertical="top"
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 rounded-lg border border-gray-300 bg-white py-3 active:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:active:bg-gray-600"
            >
              <Text className="text-center font-semibold text-gray-700 dark:text-gray-200">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!isValid()}
              className={`flex-1 rounded-lg py-3 ${
                isValid()
                  ? 'bg-blue-500 active:bg-blue-600 dark:bg-blue-600 dark:active:bg-blue-700'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <Text
                className={`text-center font-semibold ${isValid() ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
