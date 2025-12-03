import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';
import IconNavBar from '@/components/navigation/IconNavBar';
import NewsCard from '@/components/widgets/NewsCard';

const Settings = () => {
  //   const [user, setUser] = useAtom(userAtom);
  //   const [accessToken, setAccessToken] = useAtom(accessTokenAtom);

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
            router.replace('/landing' as any);
          }
        },
        style: action === 'Yes' ? 'destructive' : 'cancel',
      }))
    );

    // Clear user data and access token
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* <View className="flex-row items-start p-2 bg-transparent"> */}
      {/* <IconButton
          iconName="arrow-back-outline"
          size={25}
          onPress={() => router.back()}
        /> */}
      {/* </View> */}
      <View className="mb-2 items-end pb-2 pr-8">
        <IconNavBar />
      </View>

      <View className="flex-1 bg-slate-100 ">
        <View className="h-5"></View>
        <View className="mx-5 w-full flex-col items-center justify-center rounded-xl bg-white p-5">
          <SvgUri width="60" height="60" uri="https://www.svgrepo.com/show/526508/clipboard-remove.svg" />
          <Text className="font-poppins my-5 text-center text-gray-400">
            Deleting your account will remove all your data. You will need to re-register again
          </Text>
        </View>
      </View>
    </SafeAreaView>
    // <View className="flex-1 items-center justify-center bg-gray-50 px-5" style={{ backgroundColor: 'red' }}>
    //   <View className="w-full flex-col items-center justify-center rounded-xl bg-white p-5">
    //     <SvgUri width="60" height="60" uri="https://www.svgrepo.com/show/526588/logout-3.svg" />
    //     <Text className="font-poppins my-5 text-center text-gray-400">Logout from the app</Text>
    //   </View>
    //   <View className="h-5"></View>
    //   <View className="mx-5 w-full flex-col items-center justify-center rounded-xl bg-white p-5">
    //     <SvgUri width="60" height="60" uri="https://www.svgrepo.com/show/526508/clipboard-remove.svg" />
    //     <Text className="font-poppins my-5 text-center text-gray-400">
    //       Deleting your account will remove all your data. You will need to re-register again
    //     </Text>
    //   </View>
    // </View>
  );
};

export default Settings;
