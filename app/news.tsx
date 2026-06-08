import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { unwrap } from 'jotai/utils';
import { ChevronLeft } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '@/components/ui/AppText';
import NewsCard from '@/components/widgets/NewsCard';
import { imagesAtom, newsAtom } from '@/stores/ApiData';

type LoadableState<T> = { state: 'loading' } | { state: 'hasData'; data: T } | { state: 'hasError'; error: unknown };

function createLoadableAtom<T>(anAtom: any) {
  const LOADING = Symbol('loading');
  const unwrappedAtom = unwrap(anAtom, () => LOADING);

  return atom<LoadableState<T>>(get => {
    try {
      const data = get(unwrappedAtom) as T | typeof LOADING;
      if (data === LOADING) {
        return { state: 'loading' };
      }
      return { state: 'hasData', data };
    } catch (error) {
      return { state: 'hasError', error };
    }
  });
}

const newsLoadableAtom = createLoadableAtom<any[] | null>(newsAtom);
const imagesLoadableAtom = createLoadableAtom<any>(imagesAtom);

export default function NewsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const refreshNews = useSetAtom(newsAtom);
  const newsState = useAtomValue(newsLoadableAtom);
  const imagesState = useAtomValue(imagesLoadableAtom);
  const [refreshing, setRefreshing] = useState(false);
  const [newsData, setNewsData] = useState<any[]>([]);

  const images = imagesState.state === 'hasData' ? (imagesState.data as any) : null;

  useEffect(() => {
    if (newsState.state === 'hasData') {
      if (Array.isArray(newsState.data)) {
        setNewsData(newsState.data);
      } else if (newsState.data === null) {
        setNewsData([]);
      }
      setRefreshing(false);
    }
  }, [newsState]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.resolve(refreshNews()).finally(() => {
      setRefreshing(false);
    });
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

  const apiFailed = newsState.state === 'hasData' && newsState.data === null;
  const data = newsData;

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
      <View className="flex-1">
        <NewsCard
          data={data}
          refreshing={refreshing}
          onRefresh={onRefresh}
          apiFailed={apiFailed}
          isLoading={newsState.state === 'loading'}
          onPressItem={onPressItem}
          getImageFallback={getImageFallback}
        />
      </View>
    </SafeAreaView>
  );
}
