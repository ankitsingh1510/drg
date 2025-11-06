import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface FilterModalProps {
  visible: boolean;
  currentFilter: string;
  onClose: () => void;
  onFilterChange: (filter: string) => void;
}

const FILTER_OPTIONS = ['All', 'Released', 'Failed', 'Success', 'In Queue', 'Curation Completed'];

export function FilterModal({ visible, currentFilter, loading = false, onClose, onFilterChange }: FilterModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity className="flex-1 items-center justify-center bg-black/50" activeOpacity={1} onPress={onClose}>
        <View className="m-4 w-80 rounded-xl bg-white p-4">
          <Text className="mb-4 text-lg font-semibold text-slate-900">Filter by Status</Text>

          {loading ? (
            <View className="flex-row items-center justify-center py-8">
              <ActivityIndicator size="small" color="#daa521" />
              <Text className="ml-2 text-sm text-slate-600">Applying filter...</Text>
            </View>
          ) : (
            FILTER_OPTIONS.map(filterOption => (
              <TouchableOpacity
                key={filterOption}
                className={`mb-2 rounded-lg px-4 py-3 ${
                  currentFilter === filterOption ? 'border border-blue-200 bg-blue-50' : 'bg-gray-50'
                }`}
                onPress={() => onFilterChange(filterOption)}
              >
                <Text
                  className={`text-sm ${currentFilter === filterOption ? 'font-medium text-blue-700' : 'text-slate-700'}`}
                >
                  {filterOption}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
