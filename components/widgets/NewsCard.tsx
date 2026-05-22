import React, { memo, useCallback } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeInUp } from 'react-native-reanimated';

type NewsCardProps = {
  data: any[];
  refreshing: boolean;
  onRefresh: () => void;
  apiFailed: boolean;
  onPressItem: (url: string) => void;
  getImageFallback: (index: number) => string | null;
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
        className="mx-5 mb-6 overflow-hidden rounded-[16px] bg-white dark:bg-gray-800"
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
            <Text className="font-outfit-bold text-sm text-white">{index + 1}</Text>
          </View>
        </View>

        <View className="p-5">
          <View className="mb-2">
            <Text className="font-outfit-medium text-[10px] text-gray-400 dark:text-gray-500">
              {item.pubDate || 'Just now'}
            </Text>
          </View>

          <Text
            numberOfLines={2}
            className="mb-2 font-outfit-bold text-xl tracking-tight text-gray-900 dark:text-gray-100"
          >
            {item.title}
          </Text>

          <Text numberOfLines={3} className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {item.content}
          </Text>

          <View className="mt-4 flex-row items-center border-t border-gray-100 pt-4 dark:border-gray-700/50">
            <Text className="font-outfit-semibold text-xs text-blue-500 dark:text-blue-400">Read full article</Text>
            <View className="ml-2 h-1 w-1 rounded-full bg-blue-200 dark:bg-blue-800" />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const NewsCard = ({ data, refreshing, onRefresh, apiFailed, onPressItem, getImageFallback }: NewsCardProps) => {
  const renderItem = useCallback(
    ({ item, index }: any) => (
      <NewsItem item={item} index={index} onPress={onPressItem} imageFallback={getImageFallback(index)} />
    ),
    [onPressItem, getImageFallback]
  );

  return (
    <View className="flex-1">
      <FlashList
        data={data}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any, index: number) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          apiFailed ? () => <Text className="mt-10 text-center text-gray-400">No news available</Text> : undefined
        }
      />
    </View>
  );
};

export default NewsCard;
