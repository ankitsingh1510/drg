import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface User {
  name: string;
  lname: string;
}

interface PatientHeaderProps {
  user: User | null;
  totalCount: number;
  query: string;
  filter: string;
  onSearch: (text: string) => void;
  onFilterPress: () => void;
  onLogout: () => void;
}

export function PatientHeader({
  user,
  totalCount,
  query,
  filter,
  onSearch,
  onFilterPress,
  onLogout,
}: PatientHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {showMenu && (
        <Modal transparent visible={showMenu} animationType="none">
          <Pressable className="flex-1" onPress={() => setShowMenu(false)} />
        </Modal>
      )}

      <View className="border-b border-gray-200 bg-white px-4 pb-4 pt-12">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900">Order List</Text>
            {user && (
              <Text className="mt-1 text-sm text-slate-500">
                Welcome, {user.name} {user.lname}
              </Text>
            )}
            {totalCount > 0 && <Text className="mt-1 text-xs text-slate-400">{totalCount} total cases</Text>}
          </View>
          <View className="relative">
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)} className="px-2 py-2">
              <Text className="text-2xl text-slate-700">⋮</Text>
            </TouchableOpacity>

            {showMenu && (
              <View className="absolute right-0 top-10 z-50 w-32 rounded-lg border border-gray-200 bg-white shadow-lg">
                <TouchableOpacity
                  className="rounded-lg px-4 py-3"
                  onPress={() => {
                    setShowMenu(false);
                    onLogout();
                  }}
                >
                  <Text className="text-sm font-semibold text-red-500">Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Search and Filter */}
        <View className="flex-row items-center space-x-3">
          <TextInput
            value={query}
            onChangeText={onSearch}
            className="flex-1 rounded-xl border border-blue-100 bg-white px-4 py-3 text-slate-800"
            placeholder="Search by patient name"
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity className="rounded-xl border border-blue-200 bg-white px-4 py-3" onPress={onFilterPress}>
            <Text className="text-sm font-medium text-blue-700">Filter ▾</Text>
          </TouchableOpacity>
        </View>

        {(filter !== 'All' || query.trim()) && (
          <View className="mt-2 flex-row items-center space-x-4">
            {filter !== 'All' && (
              <Text className="text-sm text-slate-600">
                Filter: <Text className="font-medium">{filter}</Text>
              </Text>
            )}
            {query.trim() && (
              <Text className="text-sm text-slate-600">
                Search: <Text className="font-medium">"{query}"</Text>
              </Text>
            )}
          </View>
        )}
      </View>
    </>
  );
}
