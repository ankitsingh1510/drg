import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { FlashList } from '@shopify/flash-list';

const { width: screenWidth } = Dimensions.get('window');

export default function HScroller() {
  const listRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardWidth = screenWidth - 32;
  const data = [
    {
      url: 'https://nandiraju.github.io/drg/',
      image: require('@/assets/menu_images/slider1.png'),
      external: true,
      route: '/test',
    },
    {
      url: 'https://apps.apple.com/app/6747797336',
      image: require('@/assets/menu_images/slider2.png'),
      external: true,
      route: '/test',
    },
    {
      url: 'https://1cell.ai/in/poles2026/',
      image: require('@/assets/menu_images/slider3.png'),
      external: true,
      route: '/test',
    },
    {
      url: 'https://www.youtube.com/@1CellAi/videos',
      image: require('@/assets/menu_images/slider4.png'),
      external: true,
      route: '/test',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % data.length;
      listRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000); // this is to change slide every 3 seconds

    return () => clearInterval(timer);
  }, [currentIndex, data.length]);

  const onScrollEnd = (event: any) => {
    const position = event.nativeEvent.contentOffset.x;
    const index = Math.round(position / screenWidth);
    setCurrentIndex(index);
  };

  const handleItemPress = item => {
    if (item.external) {
      WebBrowser.openBrowserAsync(item.url);
      return;
    }
    router.push(item.route);
  };

  return (
    <View className="-mb-3">
      <FlashList
        ref={listRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth }} className="px-4">
            <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.9} className="shadow-md">
              <Image
                source={item.image}
                resizeMode="cover"
                style={{ width: cardWidth, height: 180 }}
                className="rounded-2xl"
              />
            </TouchableOpacity>
          </View>
        )}
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
