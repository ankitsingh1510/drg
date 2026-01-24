import { memo, useCallback, useRef, useState } from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { FlashList } from '@shopify/flash-list';

const { width: screenWidth } = Dimensions.get('window');

const CarouselItem = memo(({ item, width, cardWidth, onPress }: any) => (
  <View style={{ width }} className="px-4">
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9} className="shadow-md">
      <ExpoImage
        source={item.image}
        contentFit="cover"
        style={{ width: cardWidth, height: 180, borderRadius: 16 }}
        transition={300}
      />
    </TouchableOpacity>
  </View>
));
CarouselItem.displayName = 'CarouselItem';

export default function HScroller() {
  const listRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardWidth = screenWidth - 32;
  const data = [
    {
      url: 'https://nandiraju.github.io/drg/',
      image: require('@/assets/menu_images/slider1_v2.webp'),
      external: true,
      route: '/test',
    },
    {
      url: 'https://apps.apple.com/app/6747797336',
      image: require('@/assets/menu_images/slider2_v2.webp'),
      external: true,
      route: '/test',
    },
    {
      url: 'https://1cell.ai/in/poles2026/',
      image: require('@/assets/menu_images/slider3.webp'),
      external: true,
      route: '/test',
    },
    {
      url: 'https://www.youtube.com/@1CellAi/videos',
      image: require('@/assets/menu_images/slider4.webp'),
      external: true,
      route: '/test',
    },
  ];

  const onScrollEnd = useCallback((event: any) => {
    const position = event.nativeEvent.contentOffset.x;
    const index = Math.round(position / screenWidth);
    setCurrentIndex(index);
  }, []);

  const handleItemPress = useCallback((item: any) => {
    if (item.external) {
      WebBrowser.openBrowserAsync(item.url);
      return;
    }
    router.push(item.route);
  }, []);

  const renderItem = useCallback(
    ({ item }: any) => <CarouselItem item={item} width={screenWidth} cardWidth={cardWidth} onPress={handleItemPress} />,
    [cardWidth, handleItemPress]
  );

  return (
    <View className="-mb-3">
      <FlashList
        ref={listRef}
        data={data}
        horizontal
        pagingEnabled
        estimatedItemSize={screenWidth}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={renderItem}
      />

      <View className="mt-4 flex-row items-center justify-center gap-2">
        {data.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded ${i === currentIndex ? 'w-6 bg-amber-500' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
          />
        ))}
      </View>
    </View>
  );
}
