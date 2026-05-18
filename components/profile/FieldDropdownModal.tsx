import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { EnumOption } from '@/types/users';

interface FieldDropdownModalProps {
  visible: boolean;
  title: string;
  options: EnumOption[];
  onSelect: (option: EnumOption) => void;
  onClose: () => void;
}

export default function FieldDropdownModal({ visible, title, options, onSelect, onClose }: FieldDropdownModalProps) {
  const handleSelect = (option: EnumOption) => {
    onSelect(option);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={onClose}>
        <View className="mx-5 w-80 max-w-full rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800">
          <Text className="mb-3 text-lg font-outfit-semibold text-gray-800 dark:text-gray-100">{title}</Text>
          <ScrollView className="max-h-80">
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSelect(option)}
                className="rounded-lg px-4 py-3 active:bg-gray-100 dark:active:bg-gray-700"
              >
                <Text className="text-base text-gray-800 dark:text-gray-100">{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} className="mt-3 rounded-lg bg-gray-200 px-4 py-2 dark:bg-gray-700">
            <Text className="text-center font-outfit-semibold text-gray-800 dark:text-gray-100">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}
