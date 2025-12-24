import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

type OncoItem = {
  fileName: string;
  title: string;
  summary: string;
};

type Props = {
  item: OncoItem;
};

export default function OncoCard({ item }: Props) {
  const openInBrowser = (url: string) => WebBrowser.openBrowserAsync(url);
  return (
    <View className="my-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <Text className="text-center text-2xl font-semibold text-gray-900 dark:text-white">{item.title}</Text>
      <Text className="mt-4 text-lg leading-7 text-gray-700 dark:text-gray-300">{item.summary}</Text>
      <Pressable
        onPress={() =>
          openInBrowser('https://nandiraju.github.io/lab_tests/tests/' + encodeURIComponent(item.fileName))
        }
      >
        <Text className="text-l mt-4 w-32 self-center rounded-full bg-blue-300 p-2 text-center text-gray-900">
          More details..
        </Text>
      </Pressable>
    </View>
  );
}
