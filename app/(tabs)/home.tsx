import React, { useCallback, useMemo } from 'react';
import { Alert, BackHandler, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useHeaderHeight } from '@react-navigation/elements';
import { useAtom } from 'jotai';
import {
  ClipboardList,
  Dna,
  LucideColumnsSettings,
  Microscope,
  Settings,
  TestTube2,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import { type HomeItem, HomeSection } from '@/components/ui/HomeScreenCard';
import TipOfTheDay from '@/components/widgets/Tipoftheday';
import { colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { showExtensionsButtonAtom, showPatientsButtonAtom } from '@/stores/ui';

const openInBrowser = (url: string) => WebBrowser.openBrowserAsync(url);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
};

export default function LandingScreen() {
  const { user } = useAuth();
  const { colorScheme } = useColorScheme();
  const headerHeight = useHeaderHeight();
  const isDark = colorScheme === 'dark';
  const greeting = useMemo(() => getGreeting(), []);
  const [showPatientsButton] = useAtom(showPatientsButtonAtom);
  const [showExtensionsButton] = useAtom(showExtensionsButtonAtom);

  const clinicalItems: HomeItem[] = useMemo(() => {
    const items = [
      {
        id: 'patient',
        label: 'Patient',
        subtitle: 'Recent labs & images',
        icon: <ClipboardList size={24} color="#fff" />,
        color: '#538BF4',
        onPress: () => router.push('/reports_list' as any),
        comingSoon: false,
        hidden: false,
      },
      {
        id: 'orders',
        label: 'Orders',
        subtitle: 'Recent orders & updates',
        icon: <TestTube2 size={24} color="#fff" />,
        color: '#4ED0D9',
        onPress: () => router.push('/Orders/allOrders' as any),
        comingSoon: false,
        hidden: false,
      },
      {
        id: 'mtb',
        label: 'MTB',
        subtitle: 'Case discussion & Insights',
        icon: <Dna size={24} color="#fff" />,
        color: '#A576F4',
        onPress: () => openInBrowser(process.env.EXPO_PUBLIC_MTB_URL || ''),
        comingSoon: true,
        hidden: false,
      },
    ];
    return items.filter((item: any) => !item.hidden) as HomeItem[];
  }, [showPatientsButton]);

  const educationItems: HomeItem[] = useMemo(
    () => [
      {
        id: 'publications',
        label: 'Publication',
        subtitle: 'Poster & Publications',
        icon: <Microscope size={24} color="#fff" />,
        color: '#F8A03C',
        onPress: () => openInBrowser(process.env.EXPO_PUBLIC_PUBLICATIONS_URL || ''),
      },
      {
        id: 'trends',
        label: 'Trends',
        subtitle: 'Latest around Genomics & NGS',
        icon: <TrendingUp size={24} color="#fff" />,
        color: '#36B879',
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
    <SafeAreaView style={{ flex: 1 }} className="bg-[#FDF5E6] dark:bg-gray-900">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: headerHeight }}>
        <View className="bg-[#FDF5E6] pb-8 dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View className="px-6 pb-6 pt-4">
              <AppText className="text-base text-gray-500 dark:text-gray-400">{greeting}</AppText>
              <AppText className="text-2xl text-gray-900 dark:text-white">
                Dr. {user?.name} {user?.lname}
              </AppText>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/settings' as any)}
              className="mx-4 mb-4 rounded-2xl border p-3"
              style={{
                backgroundColor: isDark ? colors.dark.cardBackground : colors.light.cardBackground,
                borderColor: isDark ? '#374151' : '#EBEBEB',
              }}
            >
              <User size={28} color={colorScheme === 'dark' ? '#fff' : colors.common.accent} strokeWidth={1.3} />
            </TouchableOpacity>
          </View>

          <HomeSection title="Clinical Workspace" headerIcon="flask-outline" items={clinicalItems} />
          <HomeSection title="Education & Research" headerIcon="book-outline" items={educationItems} />

          <TipOfTheDay />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
