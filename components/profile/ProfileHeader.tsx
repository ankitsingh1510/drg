import React from 'react';
import { Text, View } from 'react-native';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  organizationName: string;
}

export default function ProfileHeader({ firstName, lastName, organizationName }: ProfileHeaderProps) {
  const firstInitial = firstName?.charAt(0).toUpperCase() || 'U';
  const lastInitial = lastName?.charAt(0).toUpperCase() || '';

  return (
    <View className="justify-left mb-6 mt-2 flex-row items-center gap-6 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-500">
        <Text className="text-2xl font-bold text-white">
          {firstInitial}
          {lastInitial}
        </Text>
      </View>
      <View>
        <Text className="text-xl font-semibold text-gray-800 dark:text-gray-100" numberOfLines={1}>
          {firstName} {lastName}
        </Text>
        <Text className="text-m text-gray-500 dark:text-gray-400">{organizationName || 'User'}</Text>
      </View>
    </View>
  );
}
