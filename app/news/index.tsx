import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconNavBar from '@/components/navigation/IconNavBar';
import NewsCard from '@/components/widgets/NewsCard';
import { colors } from '@/constants/colors';

function NewsIndex() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-gray-900"
      style={{ backgroundColor: isDark ? colors.dark.background : colors.light.background }}
    >
      <View className="mb-4 flex-row items-center justify-between px-6 pb-2">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Trends</Text>
        <IconNavBar />
      </View>

      <View className="flex-1">
        <NewsCard count={-1} />
      </View>
    </SafeAreaView>
  );
}

export default NewsIndex;

const styles = StyleSheet.create({});
