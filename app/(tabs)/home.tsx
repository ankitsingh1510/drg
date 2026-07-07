import React, { useCallback, useMemo } from 'react';
import { Alert, BackHandler, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useHeaderHeight } from '@react-navigation/elements';
import { useAtom } from 'jotai';
import { Bell, ClipboardList, Dna, FileText, TestTube2, TrendingUp, User } from 'lucide-react-native';
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
        label: 'Patient reports',
        subtitle: 'Reports & insights',
        icon: <ClipboardList size={28} color="#3B82F6" />,
        color: '#EFF6FF',
        onPress: () => router.push('/reports_list' as any),
        comingSoon: false,
        hidden: false,
      },
      {
        id: 'orders',
        label: 'Orders',
        subtitle: 'Track test progress',
        icon: <TestTube2 size={28} color="#F59E0B" />,
        color: '#FFFBEB',
        onPress: () => router.push('/Orders/allOrders' as any),
        comingSoon: false,
        hidden: false,
      },
      {
        id: 'mtb',
        label: 'MTB',
        subtitle: 'Case library',
        icon: <Dna size={24} color="#A576F4" />,
        color: '#F8FAFC',
        onPress: () => openInBrowser(process.env.EXPO_PUBLIC_MTB_URL || ''),
        comingSoon: true,
        hidden: true,
      },
    ];
    return items.filter((item: any) => !item.hidden) as HomeItem[];
  }, [showPatientsButton]);

  const educationItems: HomeItem[] = useMemo(
    () => [
      {
        id: 'publications',
        label: 'Publications',
        subtitle: 'Research & posters',
        icon: <FileText size={28} color="#10B981" />,
        color: '#ECFDF5',
        onPress: () => router.push('/publications' as any),
      },
      {
        id: 'trends',
        label: 'News',
        subtitle: 'Latest clinical updates',
        icon: <TrendingUp size={28} color="#DC2626" />,
        color: '#FEF2F2',
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
    <SafeAreaView style={{ flex: 1 }} className="bg-[#1A365D] dark:bg-gray-900">
      <View className="bg-[#1A365D] dark:bg-gray-900">
        <View className="flex-row items-center px-6 pb-2 pt-6">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <AppText className="font-outfit-bold text-lg text-white">
              {((user?.name || 'N')[0] + (user?.lname || 'A')[0]).toUpperCase()}
            </AppText>
          </View>
          <View>
            <AppText className="font-outfit text-sm text-gray-300 dark:text-gray-400">Hello, Welcome</AppText>
            <AppText className="font-outfit-bold text-xl text-white dark:text-white">
              Dr. {user?.name || 'N'} {user?.lname || 'A'}
            </AppText>
          </View>
        </View>

        <View
          style={{
            backgroundColor: '#DAA52029',
            paddingVertical: 4,
            width: '30%',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            margin: 18,
            marginBottom: 0,
          }}
        >
          <AppText className="font-outfit-semibold text-xs tracking-wider text-[#F59E0B]">COMING SOON</AppText>
        </View>

        <View
          style={{
            marginHorizontal: 20,
            marginTop: 24,
          }}
        >
          <View className="flex-row items-center justify-between">
            <AppText className="font-outfit-bold text-xl leading-[28px] text-white">
              The future of{'\n'}Molecular Case{'\n'}Discussions
            </AppText>
            <Image
              source={require('@/assets/home_banner.png')}
              className="h-[180px] w-[200px]"
              resizeMode="contain"
              style={{ position: 'absolute', right: 0 }}
            />
          </View>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-6 flex-1 bg-[#F8FAFC] pt-6 dark:bg-gray-900">
          <HomeSection title="Clinical Workspace" headerIcon="" items={clinicalItems} layout="grid" />
          <HomeSection title="Education & Research" headerIcon="" items={educationItems} layout="grid" />
          <TipOfTheDay />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
