import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import IconNavBar from '../navigation/IconNavBar';

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
      <View
        className={`border-b border-gray-200 bg-white px-4 pb-4 ${Platform.OS === 'ios' ? 'pt-2' : 'pt-2'}`}
        style={{ backgroundColor: '#FDF5E6' }}
      >
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
          <IconNavBar />
          {/* <View className="flex flex-row items-center justify-center">
              <Text className="text-2xl text-slate-700">Home</Text>
              <TouchableOpacity onPress={() => setShowMenu(!showMenu)} className="px-2 py-2">
                <Text className="text-2xl text-slate-700">⋮</Text>
              </TouchableOpacity>
            </View> */}
        </View>

        {/* Search and Filter */}
        <View className="flex-row items-center gap-1">
          <TextInput
            value={query}
            onChangeText={onSearch}
            className="flex-1 rounded-lg border border-blue-100 bg-white px-4 py-3 text-slate-800"
            placeholder="Search by patient name"
            placeholderTextColor="#64748b"
          />
          <TouchableOpacity className="rounded-lg border border-blue-200 bg-white px-4 py-3" onPress={onFilterPress}>
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

      {showMenu && (
        <Modal transparent visible={showMenu} animationType="fade" onRequestClose={() => setShowMenu(false)}>
          <Pressable className="flex-1" onPress={() => setShowMenu(false)}>
            <View className="absolute right-4 top-24 z-50 w-32 rounded-lg border border-gray-200 bg-white shadow-lg">
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
          </Pressable>
        </Modal>
      )}
    </>
  );
}
