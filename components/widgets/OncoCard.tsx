import React from 'react';
import { Image, ImageBackground, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

type OncoItem = {
  fileName: string;
  title: string;
  summary: string;
  image: string;
};

type Props = {
  item: OncoItem;
};

export default function OncoCard({ item }: Props) {
  const openInBrowser = (url: string) => WebBrowser.openBrowserAsync(url);
  // image: require('@/assets/menu_images/slider1.png'),
  return (
    <View className="my-3 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <View className="h-[200px] w-full overflow-hidden rounded-xl">
        <ImageBackground source={{ uri: item.image }} resizeMode="cover" className="flex-1">
          <View className="absolute inset-0 bg-black/30" />

          <Text className="absolute bottom-3 left-3 right-3 text-3xl font-extrabold text-white shadow">
            {item.title}
          </Text>
        </ImageBackground>
      </View>

      {/* <Text className="text-center text-2xl font-semibold text-gray-900 dark:text-white">{item.title}</Text> */}
      <Text className="mt-4 px-2 text-lg leading-7 text-gray-700 dark:text-gray-300">{item.summary}</Text>
      <Pressable
        onPress={() =>
          openInBrowser('https://nandiraju.github.io/lab_tests/tests/' + encodeURIComponent(item.fileName))
        }
      >
        <Text className="text-l my-4 w-32 self-center rounded-full bg-blue-300 p-2 text-center text-gray-900">
          More details..
        </Text>
      </Pressable>
    </View>
  );
}
