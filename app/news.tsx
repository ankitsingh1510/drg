import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import NewsCard from '@/components/widgets/NewsCard';
import { colors } from '@/constants/colors';

export default function NewsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      edges={[]}
      style={{ flex: 1, backgroundColor: isDark ? colors.dark.background : colors.light.background }}
    >
      <View className="flex-1">
        <NewsCard count={-1} />
      </View>
    </SafeAreaView>
  );
}
