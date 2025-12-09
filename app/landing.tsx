import React, { useEffect, useMemo } from 'react';
import { Alert, BackHandler, Image, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ClipboardList, CogIcon, Dna, Microscope, TestTube2, TrendingUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeadingDivider } from '@/components/navigation/HeadingDivider';
import HScroller from '@/components/navigation/HScroller';
import SimpleButton from '@/components/navigation/SimpleButton';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/util/helpers';

const openInBrowser = (url: string) => WebBrowser.openBrowserAsync(url);

export default function LandingScreen() {
  const { user, usersStudyList } = useAuth();
  const date = useMemo(() => formatDate(), []);

  const clinicalButtons = useMemo(
    () => [
      {
        icon: ClipboardList,
        heading: 'Patient',
        color: '#006400',
        sub: 'Patients Recent labs & imaging',
        onPress: () => router.push('/patients' as any),
      },
      {
        icon: TestTube2,
        heading: 'Order Tests',
        color: '#5C7AC6',
        sub: '1Cell.Ai Tests & Panels',
        onPress: () => openInBrowser(process.env.EXPO_PUBLIC_ORDER_TESTS_URL || ''),
      },
      {
        icon: Dna,
        heading: 'MTB',
        color: '#91A3B0',
        sub: 'Case discussions & insights',
        onPress: () => openInBrowser(process.env.EXPO_PUBLIC_MTB_URL || ''),
      },
      {
        icon: CogIcon,
        heading: 'Settings',
        color: '#E5575E',
        sub: 'Profile & App Preferences',
        onPress: () => router.push('/settings' as any),
      },
    ],
    []
  );

  const educationButtons = useMemo(
    () => [
      {
        icon: Microscope,
        heading: 'Publications',
        color: '#445278',
        sub: '1Cell.Ai Posters & publications',
        onPress: () => openInBrowser(process.env.EXPO_PUBLIC_PUBLICATIONS_URL || ''),
      },
      {
        icon: TrendingUp,
        heading: 'Trends',
        color: '#738BD6',
        sub: 'Latest around Genomics & NGS',
        onPress: () => router.push('/news' as any),
      },
    ],
    []
  );

  // Exit dialog for Android
  useEffect(() => {
    const onBackPress = () => {
      // if (router.canGoBack()) return false;
      Alert.alert('Exit App', 'Are you sure you want to exit the app?', [
        { text: 'No' },
        { text: 'Yes', onPress: () => BackHandler.exitApp() },
      ]);

      return true;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6]">
      <ScrollView>
        <LinearGradient colors={['#FDF5E6', '#FDF5E6', '#FFF8DC']} className="pb-8">
          <Text className="text-blue mt-10 pl-6 text-2xl font-semibold">
            Welcome, {user?.name} {user?.lname}
          </Text>
          <Text className="mb-6 pl-6 text-xl text-gray-500">🗓️ {date}</Text>

          <HScroller />
          <View className="mt-6 h-3"></View>
          <HeadingDivider hideRightIcon iconName="albums-outline" title="Clinical Workspace" />

          <View className="flex-row flex-wrap justify-evenly gap-5 p-5">
            {clinicalButtons.map((item, idx) => (
              <SimpleButton
                key={idx}
                icon={item.icon}
                heading={item.heading}
                iconContainerColor={item.color}
                subheading={item.sub}
                onPress={item.onPress}
              />
            ))}
          </View>

          <HeadingDivider hideRightIcon iconName="book-outline" title="Education & Research" />

          <View className="flex-row flex-wrap justify-evenly gap-5 p-5">
            {educationButtons.map((item, idx) => (
              <SimpleButton
                key={idx}
                icon={item.icon}
                heading={item.heading}
                iconContainerColor={item.color}
                subheading={item.sub}
                onPress={item.onPress}
              />
            ))}
          </View>

          <Image
            source={require('@/assets/banner.png')}
            className="mt-3 h-[120px] w-[94%] self-center rounded-2xl"
            resizeMode="cover"
          />
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
