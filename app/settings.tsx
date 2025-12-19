import React from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MinusCircle, Moon, Sun } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';
import IconNavBar from '@/components/navigation/IconNavBar';
import NewsCard from '@/components/widgets/NewsCard';
import { colors } from '@/constants/colors';
import { useLogout } from '@/context/AuthContext';
import { useThemeSync } from '@/hooks/useThemeSync';

const Settings = () => {
  //   const [user, setUser] = useAtom(userAtom);
  //   const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const logout = useLogout();
  const { theme, toggleTheme } = useThemeSync();
  const handleSignOut = () => {
    // Clear user data and access token
    //setUser(null);
  };

  async function handleDeleteAccount(): Promise<void> {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      ['Yes', 'No'].map(action => ({
        text: action,
        onPress: () => {
          if (action === 'Yes') {
            // router.replace('/landing' as any);
            logout();
          }
        },
        style: action === 'Yes' ? 'destructive' : 'cancel',
      }))
    );

    // Clear user data and access token
  }
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <LinearGradient colors={theme === 'dark' ? colors.gradients.dark : colors.gradients.light} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="mb-2 items-end pb-2 pr-8">
            <IconNavBar />
          </View>

          <View className="flex-1">
            <View className="h-5"></View>

            {/* Theme Toggle Card */}
            <View
              className="mx-5 mb-5 flex-row items-center justify-between rounded-xl bg-white p-5 dark:bg-gray-800"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                {theme === 'dark' ? (
                  <Moon size={24} color={colors.common.info} />
                ) : (
                  <Sun size={24} color={colors.common.warning} />
                )}
                <Text className="ml-3 text-lg font-medium text-gray-800 dark:text-gray-100">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.light.border, true: colors.common.info }}
                thumbColor={theme === 'dark' ? '#1e40af' : '#f3f4f6'}
              />
            </View>

            {/* Delete Account Card */}
            <View
              className="mx-5 flex-col items-center justify-center rounded-xl bg-white p-5 dark:bg-gray-800"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <TouchableOpacity onPress={handleDeleteAccount} className="mb-4 mt-2">
                <View className="rounded-full bg-red-300 p-8">
                  {/* <SvgUri width="60" height="60" uri="https://www.svgrepo.com/show/526508/clipboard-remove.svg" /> */}
                  <MinusCircle size={48} color="red" />
                </View>
              </TouchableOpacity>

              <Text className="font-poppins my-5 text-center text-gray-400 dark:text-gray-300">
                Deleting your account will remove all your data. You will need to re-register again
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default Settings;
