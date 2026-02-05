import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { FlashList } from '@shopify/flash-list';
import { useAtomValue } from 'jotai';
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
      entering={FadeInUp.delay(index * 100)
        .duration(600)
        .springify()}
    >
      <Pressable
        onPress={() => onPress(item.link)}
        style={({ pressed }) => [
          {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: pressed ? 0.05 : 0.1,
            shadowRadius: pressed ? 2 : 4,
            elevation: pressed ? 1 : 3,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
        className="mx-5 mb-6 overflow-hidden rounded-[28px] bg-white dark:bg-gray-800"
      >
        <View className="h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <ExpoImage
            source={imageUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={400}
            cachePolicy="disk"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgRj' }}
          />
          {/* Rank Badge */}
          <View className="absolute left-4 top-4 h-8 w-8 items-center justify-center rounded-full bg-blue-500/90 shadow-sm">
            <Text className="text-sm font-bold text-white">{index + 1}</Text>
          </View>
        </View>

        <View className="p-5">
          <View className="mb-2">
            <Text className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
              {item.pubDate || 'Just now'}
            </Text>
          </View>

          <Text numberOfLines={2} className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {item.title}
          </Text>

          <Text numberOfLines={3} className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {item.content}
          </Text>

          <View className="mt-4 flex-row items-center border-t border-gray-100 pt-4 dark:border-gray-700/50">
            <Text className="text-xs font-semibold text-blue-500 dark:text-blue-400">Read full article</Text>
            <View className="ml-2 h-1 w-1 rounded-full bg-blue-200 dark:bg-blue-800" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const NewsCard = ({ count }: NewsCardProps) => {
  const news = useAtomValue(newsAtom);
  const images = useAtomValue(imagesAtom);

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
    <View className="flex-1">
      <FlashList
        data={data}
        contentContainerStyle={{
          paddingTop: 30,
          paddingBottom: 60,
        }}
        keyExtractor={(item: any, index: number) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default NewsCard;
