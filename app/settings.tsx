import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MinusCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';
import IconNavBar from '@/components/navigation/IconNavBar';
import NewsCard from '@/components/widgets/NewsCard';
import { useLogout } from '@/context/AuthContext';

const Settings = () => {
  //   const [user, setUser] = useAtom(userAtom);
  //   const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const logout = useLogout();
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
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#fff', 'aqua', 'tan']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View className="mb-2 items-end pb-2 pr-8">
            <IconNavBar />
          </View>

          <View className="flex-1">
            <View className="h-5"></View>

            <View
              className="mx-5 flex-col items-center justify-center rounded-xl bg-white p-5"
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

              <Text className="font-poppins my-5 text-center text-gray-400">
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
