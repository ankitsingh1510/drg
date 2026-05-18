import React from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

type OncoItem = {
  fileName: string;
  title: string;
  summary: string;
  image: string;
  badge?: string;
  sampleTypes?: string[];
};

type Props = {
  item: OncoItem;
};

export default function OncoCard({ item }: Props) {
  const openInBrowser = (url: string) => WebBrowser.openBrowserAsync(url);
  return (
    <Pressable
      onPress={() => openInBrowser('https://nandiraju.github.io/lab_tests/tests/' + encodeURIComponent(item.fileName))}
      className="my-2 overflow-hidden rounded-2xl bg-white shadow-md dark:bg-gray-800"
    >
      <View className="h-[150px] w-full overflow-hidden">
        <ImageBackground source={{ uri: item.image }} resizeMode="cover" className="flex-1">
          <View className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

          {/* Badge */}
          {item.badge && (
            <View className="absolute left-4 top-4">
              <View className="rounded-full bg-amber-400 px-4 py-1">
                <Text className="text-xs font-outfit-bold text-gray-900">{item.badge}</Text>
              </View>
            </View>
          )}

          {/* Title */}
          <View className="absolute bottom-0 left-0 right-0 p-4">
            <Text className="text-3xl font-outfit-bold text-white">{item.title}</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Content Section */}
      <View className="bg-white p-4 dark:bg-gray-800">
        <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">{item.summary}</Text>

        <View className="flex-row items-center justify-between">
          {item.sampleTypes ? (
            <View className="flex-row gap-2">
              {item.sampleTypes.map((type, index) => (
                <View key={index} className="rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
                  <Text className="text-sm font-outfit-medium text-gray-700 dark:text-gray-300">{type}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View />
          )}

          <View className="flex-row items-center">
            <Text className="mr-1 text-base font-outfit-semibold text-amber-500">View details</Text>
            <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
