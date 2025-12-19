import React, { useEffect } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAtom, useAtomValue } from 'jotai';
import { useColorScheme } from 'nativewind';
import { colors } from '@/constants/colors';
import { imagesAtom, newsAtom } from '@/stores/ApiData';

type NewsCardProps = {
  count: number;
};

const NewsCard = ({ count }: NewsCardProps) => {
  const [news, setnews] = useAtom(newsAtom);
  const images = useAtomValue(imagesAtom);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!news || news.length === 0) {
    return <Text className="mt-10 text-center text-gray-400">No news available.</Text>;
  }

  const getRandomImage = () => {
    if (images.results.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * images.results.length);
    console.log('Random Image Index:', randomIndex);
    return images.results[randomIndex].urls.small;
  };

  const handleClick = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <>
      <FlatList
        data={count == -1 ? news : news.slice(0, count)}
        contentContainerStyle={{
          backgroundColor: isDark ? colors.dark.background : colors.light.background,
          flexGrow: 1,
          paddingTop: 25,
        }}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleClick(item.link)}
            className="mx-5 my-2 mb-4 rounded-xl border border-gray-200 bg-white p-4 pb-7 dark:border-gray-700 dark:bg-gray-800"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              numberOfLines={2}
              className="font-poppins-semibold text-lg font-semibold leading-tight text-gray-800 dark:text-gray-100"
            >
              {item.title}
            </Text>

            <View className="mt-3 flex-row items-start gap-3">
              <Image
                source={{
                  uri: item.image ? item.image : getRandomImage(),
                }}
                className="h-[100px] w-[100px] rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text
                  numberOfLines={5}
                  ellipsizeMode="tail"
                  className="font-poppins text-sm text-gray-600 dark:text-gray-300"
                >
                  {item.content}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </>
  );
};

export default NewsCard;
