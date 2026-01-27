import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import tips from './tips';

export default function TipOfTheDay() {
  const getRandomTip = useCallback((excludeTip?: any) => {
    if (!Array.isArray(tips)) return { tip: 'No tips available', emoji: '⚡' };
    const availableTips = excludeTip ? tips.filter((t: any) => t.tip !== excludeTip.tip) : tips;
    const pool = availableTips.length > 0 ? availableTips : tips;
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const [currentTip, setCurrentTip] = useState(getRandomTip());
  const [refreshKey, setRefreshKey] = useState(0);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleNextTip = useCallback(() => {
    setCurrentTip(getRandomTip(currentTip));
    setRefreshKey(prev => prev + 1);
  }, [currentTip, getRandomTip]);

  return (
    <View
      style={[styles.container, { backgroundColor: isDark ? colors.dark.cardBackground : colors.light.cardBackground }]}
    >
      <Animated.View
        key={`content-${refreshKey}`}
        entering={FadeInUp.springify().damping(15)}
        exiting={FadeOut.duration(150)}
        className="items-center"
      >
        <Animated.Text className="self-center p-2 text-center text-3xl">{currentTip.emoji}</Animated.Text>

        <Animated.Text className="mb-4 px-4 text-center text-lg font-medium text-gray-900 dark:text-gray-100">
          {currentTip.tip}
        </Animated.Text>
      </Animated.View>

      <TouchableOpacity
        onPress={handleNextTip}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
        style={styles.nextButton}
        className="bg-gray-200 shadow-sm dark:bg-gray-700"
      >
        <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">Next tip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
    minHeight: 180,
    justifyContent: 'center',
  },
  nextButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
