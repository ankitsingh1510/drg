import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import NewsCard from '@/components/widgets/NewsCard';
import { colors } from '@/constants/colors';

export default function NewsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-[#FDF5E6] dark:bg-[#111827]" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity className="h-8 w-8 items-center justify-center" onPress={() => router.back()}>
          <ChevronLeft size={24} color={isDark ? '#FFFFFF' : '#1F2937'} strokeWidth={2.5} />
        </TouchableOpacity>
        <AppText weight="semibold" className="text-xl text-[#0F2D37] dark:text-white">
          Trends
        </AppText>
        <View className="w-8" />
      </View>
      <View className="mt-2 flex-1">
        <NewsCard count={-1} />
      </View>
    </SafeAreaView>
  );
}
