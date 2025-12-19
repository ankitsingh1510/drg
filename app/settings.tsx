import React from 'react';
import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Moon, Sun, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconNavBar from '@/components/navigation/IconNavBar';
import { colors } from '@/constants/colors';
import { useLogout } from '@/context/AuthContext';
import { useThemeSync } from '@/hooks/useThemeSync';

const Settings = () => {
  const logout = useLogout();
  const { theme, toggleTheme } = useThemeSync();

  const isDark = theme === 'dark';

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [
      {
        text: 'No',
        style: 'cancel',
      },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      {/* Header */}
      <View className="mb-2 items-end pb-2 pr-8">
        <IconNavBar />
      </View>

      <View className="flex-1">
        {/* Theme Toggle Card */}
        <View className="mx-5 mb-5 min-h-[80px] flex-row items-center justify-between rounded-xl bg-white p-5 shadow-md dark:bg-gray-800">
          <View className="flex-row items-center">
            <View className="rounded-full bg-gray-100 p-3 dark:bg-blue-900/30">
              {isDark ? <Moon size={24} color={colors.common.info} /> : <Sun size={24} color={colors.common.warning} />}
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-lg font-medium text-gray-800 dark:text-gray-100">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {isDark ? 'Dark theme is active' : 'Light theme is active'}
              </Text>
            </View>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: colors.light.border,
              true: colors.common.info,
            }}
            thumbColor={isDark ? '#1e40af' : '#f3f4f6'}
          />
        </View>

        {/* Delete Account Card */}
        <View className="mx-5 min-h-[80px] flex-row items-center justify-between rounded-xl bg-white p-5 shadow-md dark:bg-gray-800">
          <View className="flex-row items-center">
            <View className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
              <Trash2 size={20} color="#dc2626" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-lg font-medium text-gray-800 dark:text-gray-100">Delete Account</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Permanently remove all data</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            className="rounded-lg bg-red-500 px-4 py-2 active:bg-red-600 dark:bg-red-600"
          >
            <Text className="text-sm font-semibold text-white">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
