import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function Patients() {
  const { logout, user } = useAuth();

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 items-center justify-center">
        <Text className="mb-4 text-xl font-bold text-gray-900">Hello i am patients</Text>

        {user && (
          <Text className="mb-8 text-base text-gray-600">
            Welcome, {user.name} {user.lname}!
          </Text>
        )}

        <TouchableOpacity className="rounded-lg bg-red-500 px-6 py-3" onPress={logout}>
          <Text className="text-base font-semibold text-white">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
