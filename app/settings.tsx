import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { useAtom } from 'jotai';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Sun,
  Trash2,
  User,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconNavBar from '@/components/navigation/IconNavBar';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { useAuth, useLogout } from '@/context/AuthContext';
import { useThemeSync } from '@/hooks/useThemeSync';
import { hasSeenOnboardingAtom } from '@/stores/onboarding';
import { showExtensionsButtonAtom, showPatientsButtonAtom } from '@/stores/ui';

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
          <AppText className="text-lg font-outfit-medium text-gray-800 dark:text-gray-100">{title}</AppText>
          <AppText className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</AppText>
        </View>
      </View>

      {btn}
    </Card>
  );
};

const Settings = () => {
  const logout = useLogout();
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeSync();
  const headerHeight = useHeaderHeight();
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastTapRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const tapTimerRef = useRef<any>(null);

  const [, setShowPatientsButton] = useAtom(showPatientsButtonAtom);
  const [showExtensionsButton, setShowExtensionsButton] = useAtom(showExtensionsButtonAtom);

  const isDarkMode = theme === 'dark';

  useEffect(() => {
    checkNotificationPermission();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkNotificationPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPushNotificationsEnabled(status === 'granted');
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      if (status === 'undetermined' || canAskAgain) {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus === 'granted') {
          setPushNotificationsEnabled(true);
        }
        return;
      } else {
        Alert.alert('Permission Required', 'Please enable notifications in your device settings to receive updates.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]);
        setPushNotificationsEnabled(false);
        return;
      }
    } else {
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please update the permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
    }
  };

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

  const goToChangePassword = () => {
    if (!user?.sub) {
      Alert.alert('Error', 'Unable to access change password. Please log in again.');
      return;
    }
    router.push({
      pathname: '/reset-password' as any,
      params: { userMasterId: user.sub, source: 'settings' },
    });
  };

  const [, setHasSeenOnboarding] = useAtom(hasSeenOnboardingAtom);

  const resetOnboarding = () => {
    Alert.alert('Reset Onboarding', 'This will show the onboarding screens again. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: () => {
          setHasSeenOnboarding(false);
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const settingsData: SettingCardProps[] = [
    {
      icon: <User size={24} color={colors.common.info} />,
      title: 'My Profile',
      subtitle: 'View and edit your profile',
      iconBgColor: 'bg-blue-100 dark:bg-blue-900/30',
      btn: <ChevronRight size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />,
      onPress: goToProfile,
    },
    {
      icon: <Lock size={24} color={colors.common.warning} />,
      title: 'Change Password',
      subtitle: 'Update your password',
      iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      btn: <ChevronRight size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />,
      onPress: goToChangePassword,
    },
    {
      icon: isDarkMode ? (
        <Moon size={24} color={colors.common.info} />
      ) : (
        <Sun size={24} color={colors.common.warning} />
      ),
      title: isDarkMode ? 'Dark Mode' : 'Light Mode',
      subtitle: isDarkMode ? 'Dark theme is active' : 'Light theme is active',
      iconBgColor: isDarkMode ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100',
      btn: (
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{
            false: colors.light.border,
            true: colors.common.info,
          }}
          thumbColor={isDarkMode ? '#1e40af' : '#f3f4f6'}
        />
      ),
    },
    {
      icon: <Bell size={24} color={pushNotificationsEnabled ? colors.common.success : '#9ca3af'} />,
      title: 'Push Notifications',
      subtitle: pushNotificationsEnabled ? 'Get updates and alerts' : 'Enable to receive updates',
      iconBgColor: pushNotificationsEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700/30',
      btn: (
        <Switch
          value={pushNotificationsEnabled}
          onValueChange={handleNotificationToggle}
          trackColor={{
            false: colors.light.border,
            true: colors.common.success,
          }}
          thumbColor={pushNotificationsEnabled ? '#16a34a' : '#f3f4f6'}
          ios_backgroundColor={colors.light.border}
        />
      ),
    },
    {
      icon: <Trash2 size={20} color="#dc2626" />,
      title: 'Delete Account',
      subtitle: 'Permanently remove all data',
      iconBgColor: 'bg-red-100 dark:bg-red-900/30',
      btn: (
        <TouchableOpacity
          onPress={confirmDeleteAccount}
          className="rounded-lg bg-red-500 px-4 py-2 active:bg-red-600 dark:bg-red-600"
        >
          <AppText className="text-sm font-outfit-semibold text-white">Delete</AppText>
        </TouchableOpacity>
      ),
    },
    {
      icon: <HelpCircle size={24} color={colors.common.primary} />,
      title: 'Show Onboarding',
      subtitle: 'Review the app features',
      iconBgColor: 'bg-amber-100 dark:bg-amber-900/30',
      onPress: resetOnboarding,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-gray-900">
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0B1929' : '#FDF5E6'}
      />

      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText className="text-xl dark:text-white">Settings</AppText>
        <View className="w-8" />
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex-1 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight }}
      >
        {settingsData.map((item, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.delay(index * 150)
              .duration(600)
              .springify()}
          >
            <SettingCard {...item} />
          </Animated.View>
        ))}

        {/* Logout button */}
        <Animated.View
          entering={FadeInUp.delay(settingsData.length * 150)
            .duration(600)
            .springify()}
        >
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logout },
              ])
            }
            activeOpacity={0.8}
            className="mx-5 mb-2 overflow-hidden rounded-xl shadow-md"
          >
            <View
              className={
                `mt-2.5 flex-row items-center justify-center gap-4 rounded-xl border py-2.5 ` +
                (isDarkMode ? 'border-red-900 bg-red-900' : 'border-red-200 bg-red-100')
              }
            >
              <LogOut size={18} color={isDarkMode ? '#fff' : '#7f1d1d'} strokeWidth={2} />
              <AppText
                className={isDarkMode ? 'text-base text-white' : 'text-base text-red-900'}
                style={{ fontFamily: 'Outfit_600SemiBold' }}
              >
                Sign Out
              </AppText>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay((settingsData.length + 1) * 150)
            .duration(600)
            .springify()}
        >
          <Pressable
            onPress={() => {
              const now = Date.now();
              const TAP_DELAY = 300; // Slightly shorter for better feel

              if (now - lastTapRef.current < TAP_DELAY) {
                tapCountRef.current += 1;
              } else {
                tapCountRef.current = 1;
              }
              lastTapRef.current = now;

              if (tapTimerRef.current) {
                clearTimeout(tapTimerRef.current);
              }

              tapTimerRef.current = setTimeout(() => {
                if (tapCountRef.current === 2) {
                  setShowPatientsButton(prev => !prev);
                  Alert.alert(
                    'System Info',
                    `Version: ${Constants.expoConfig?.version || '1.1.5'}\nBundle ID: ${Constants.expoConfig?.ios?.bundleIdentifier || 'ai.onecell.drg'}`
                  );
                } else if (tapCountRef.current >= 3) {
                  setShowExtensionsButton(prev => !prev);
                  Alert.alert(
                    'System Info',
                    `Version: ${Constants.expoConfig?.version || '1.1.5'}\nBundle ID: ${Constants.expoConfig?.ios?.bundleIdentifier || 'ai.onecell.drg'}\nExtensions: ${!showExtensionsButton ? 'Enabled' : 'Disabled'}`
                  );
                }
                tapCountRef.current = 0;
              }, TAP_DELAY);
            }}
            className="mb-8 mt-4 items-center justify-center opacity-60"
          >
            <AppText className="text-xs font-outfit-medium text-gray-500 dark:text-gray-400">Dr.G AI Assistant</AppText>
            <AppText className="text-[10px] text-gray-400 dark:text-gray-500">
              Version {Constants.expoConfig?.version || '1.1.5'}
            </AppText>
          </Pressable>
        </Animated.View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
