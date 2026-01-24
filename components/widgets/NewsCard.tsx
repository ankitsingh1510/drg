import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { FlashList } from '@shopify/flash-list';
import { useAtomValue } from 'jotai';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { imagesAtom, newsAtom } from '@/stores/ApiData';

type NewsCardProps = {
  count: number;
};

const NewsItem = memo(({ item, index, imageFallback, onPress }: any) => {
  let imageUrl = item.image && item.image.length > 0 ? item.image : imageFallback;

  if (imageUrl && imageUrl.startsWith('http://')) {
    imageUrl = imageUrl.replace('http://', 'https://');
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 120)
        .duration(600)
        .springify()}
    >
      <Pressable
        onPress={() => onPress(item.link)}
        className="mx-5 my-2 mb-4 rounded-xl border border-gray-200 bg-white p-4 pb-7 dark:border-gray-700 dark:bg-gray-800"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text numberOfLines={2} className="text-lg font-semibold leading-tight text-gray-800 dark:text-gray-100">
          {item.title}
        </Text>

        <View className="mt-3 flex-row items-start gap-3">
          <View className="h-[100px] w-[100px] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700">
            <ExpoImage
              source={imageUrl}
              style={{ width: 100, height: 100 }}
              contentFit="cover"
              transition={300}
              cachePolicy="disk"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgRj' }}
            />
          </View>
          <View className="flex-1">
            <Text numberOfLines={5} ellipsizeMode="tail" className="text-sm text-gray-600 dark:text-gray-300">
              {item.content}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const NewsCard = ({ count }: NewsCardProps) => {
  const news = useAtomValue(newsAtom);
  const images = useAtomValue(imagesAtom);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleClick = useCallback((url: string) => {
    WebBrowser.openBrowserAsync(url);
  }, []);

  const getRandomImage = useCallback(() => {
    if (!images?.results?.length) return null;
    const randomIndex = Math.floor(Math.random() * images.results.length);
    return images.results[randomIndex].urls.small;
  }, [images]);

  if (!news || news.length === 0) {
    return <Text className="mt-10 text-center text-gray-400">No news available.</Text>;
  }

  const data = count === -1 ? news : news.slice(0, count);

  const renderItem = useCallback(
    ({ item, index }: any) => (
      <NewsItem item={item} index={index} onPress={handleClick} imageFallback={getRandomImage()} />
    ),
    [handleClick, getRandomImage]
  );

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        data={data}
        contentContainerStyle={{
          backgroundColor: isDark ? colors.dark.background : colors.light.background,
          paddingTop: 25,
          paddingBottom: 40,
        }}
        estimatedItemSize={200}
        keyExtractor={(item: any, index: number) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default NewsCard;
