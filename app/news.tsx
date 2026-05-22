import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAtom, useAtomValue } from 'jotai';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import NewsCard from '@/components/widgets/NewsCard';
import { imagesAtom, newsAtom } from '@/stores/ApiData';

export default function NewsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [news, refreshNews] = useAtom(newsAtom);
  const images = useAtomValue(imagesAtom) as any;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (refreshing) setRefreshing(false);
  }, [news]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshNews();
    setTimeout(() => {
      setRefreshing(false);
    }, 3000);
  }, [refreshNews]);

  const onPressItem = useCallback((url: string) => {
    WebBrowser.openBrowserAsync(url);
  }, []);

  const getImageFallback = useCallback(
    (index: number) => {
      const results = images?.results || images?.response?.results;
      if (!results?.length) return null;
      const image = results[index % results.length];

      return image?.urls?.small || image?.urls?.regular || image?.urls?.thumb || null;
    },
    [images]
  );

  const apiFailed = news === null;
  const data = apiFailed ? [] : news;

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
        <NewsCard
          data={data}
          refreshing={refreshing}
          onRefresh={onRefresh}
          apiFailed={apiFailed}
          onPressItem={onPressItem}
          getImageFallback={getImageFallback}
        />
      </View>
    </SafeAreaView>
  );
}
