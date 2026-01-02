import React from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight, Moon, Sun, Trash2, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconNavBar from '@/components/navigation/IconNavBar';
import { colors } from '@/constants/colors';
import { useLogout } from '@/context/AuthContext';
import { useThemeSync } from '@/hooks/useThemeSync';

type SettingCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  iconBgColor: string;
  btn?: React.ReactNode;
  onPress?: () => void;
};

const SettingCard = ({ icon, title, subtitle, iconBgColor, btn, onPress }: SettingCardProps) => {
  const Card = onPress ? TouchableOpacity : View;

  return (
    <Card
      onPress={onPress}
      activeOpacity={0.7}
      className="mx-5 mb-4 min-h-[80px] flex-row items-center justify-between rounded-xl bg-white p-5 shadow-md dark:bg-gray-800"
    >
      <View className="flex-1 flex-row items-center">
        <View className={`rounded-full p-3 ${iconBgColor}`}>{icon}</View>

        <View className="ml-3 flex-1">
          <Text className="text-lg font-medium text-gray-800 dark:text-gray-100">{title}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</Text>
        </View>
      </View>

      {btn}
    </Card>
  );
};

const Settings = () => {
  const logout = useLogout();
  const { theme, toggleTheme } = useThemeSync();

  const isDarkMode = theme === 'dark';

  const confirmDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const goToProfile = () => {
    router.push('/profile' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      <View className="mb-2 items-end pb-2 pr-8">
        <IconNavBar />
      </View>

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <SettingCard
          icon={<User size={24} color={colors.common.info} />}
          title="My Profile"
          subtitle="View and edit your profile"
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          btn={<ChevronRight size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />}
          onPress={goToProfile}
        />

        <SettingCard
          icon={
            isDarkMode ? <Moon size={24} color={colors.common.info} /> : <Sun size={24} color={colors.common.warning} />
          }
          title={isDarkMode ? 'Dark Mode' : 'Light Mode'}
          subtitle={isDarkMode ? 'Dark theme is active' : 'Light theme is active'}
          iconBgColor={isDarkMode ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100'}
          btn={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{
                false: colors.light.border,
                true: colors.common.info,
              }}
              thumbColor={isDarkMode ? '#1e40af' : '#f3f4f6'}
            />
          }
        />

        <SettingCard
          icon={<Trash2 size={20} color="#dc2626" />}
          title="Delete Account"
          subtitle="Permanently remove all data"
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          btn={
            <TouchableOpacity
              onPress={confirmDeleteAccount}
              className="rounded-lg bg-red-500 px-4 py-2 active:bg-red-600 dark:bg-red-600"
            >
              <Text className="text-sm font-semibold text-white">Delete</Text>
            </TouchableOpacity>
          }
        />

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
