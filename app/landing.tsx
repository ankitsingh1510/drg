import React, { useCallback, useEffect, useMemo } from 'react';
import { Alert, BackHandler, Image, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ClipboardList, CogIcon, Dna, Microscope, TestTube2, TrendingUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeadingDivider } from '@/components/navigation/HeadingDivider';
import HScroller from '@/components/navigation/HScroller';
import SimpleButton from '@/components/navigation/SimpleButton';
import TipOfTheDay from '@/components/widgets/Tipoftheday';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/util/helpers';

const openInBrowser = (url: string) => WebBrowser.openBrowserAsync(url);

export default function LandingScreen() {
  const { user } = useAuth();
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
        sub: '1Cell.Ai Tests and Panels',
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
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit the app?', [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6]">
      <ScrollView>
        <LinearGradient colors={['#FDF5E6', '#FDF5E6', '#FFF8DC']} className="pb-8">
          <Text className="text-blue mt-10 pl-6 text-2xl font-semibold">
            Welcome, {user?.name} {user?.lname}
          </Text>
          <Text className="mb-8 pl-6 text-xl text-gray-500">🗓️ {date}</Text>

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
          <View className="mt-2 h-1"></View>
          <HeadingDivider hideRightIcon iconName="book-outline" title="Education & Research" />

          <View className="mb-8 flex-row flex-wrap justify-evenly gap-5 p-5">
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
          <HeadingDivider hideRightIcon iconName="bulb-outline" title="Tip of the day" />
          <TipOfTheDay />
          <View className="mt-2 h-1"></View>
          <View className="flex-1 items-center justify-center px-6">
            <Image source={require('@/assets/dr1.png')} resizeMode="contain" className="h-[150px] w-full rounded-3xl" />
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
