import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
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
    <View className="mb-3 mt-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <Text className="mb-1 text-center text-2xl font-semibold text-gray-900">{item.title}</Text>
      {/* <Text className="text-l mb-xl text-center text-gray-500">{item.fileName}</Text> */}

      <Text className="mt-4 text-lg leading-7 text-gray-700">{item.summary}</Text>
      <Pressable
        onPress={() =>
          openInBrowser('https://nandiraju.github.io/lab_tests/tests/' + encodeURIComponent(item.fileName))
        }
      >
        <Text className="text-l align-center mt-4 w-32 self-center rounded-full bg-blue-300 p-2 text-center text-gray-900">
          More details..
        </Text>
      </Pressable>
    </View>
  );
}
