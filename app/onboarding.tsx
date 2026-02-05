import React, { useCallback, useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { ChevronLeft, ChevronRight, FileText, MessageSquare } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { hasSeenOnboardingAtom } from '@/stores/onboarding';

const ONBOARDING_DATA = [
  {
    title: 'Analyze Reports',
    description: 'Upload your medical reports and get instant AI-powered summaries and insights tailored for you.',
    icon: FileText,
    image: require('@/assets/images/DrG-logo.png'),
  },
  {
    title: 'Voice & Chat',
    description: 'Talk or chat with Dr.G to ask questions about your health and get real-time responses anytime.',
    icon: MessageSquare,
    image: require('@/assets/images/DrG-logo.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [, setHasSeenOnboarding] = useAtom(hasSeenOnboardingAtom);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setDirection('forward');
      setCurrentIndex(prev => prev + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace('/login');
    }
  }, [currentIndex, router, setHasSeenOnboarding]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .onEnd(e => {
          if (e.translationX < -50) {
            runOnJS(handleNext)();
          } else if (e.translationX > 50) {
            runOnJS(handleBack)();
          }
        })
        .runOnJS(true),
    [handleBack, handleNext]
  );

  const currentItem = ONBOARDING_DATA[currentIndex];
  const Icon = currentItem.icon;

  return (
    <GestureHandlerRootView className="flex-1">
      <GestureDetector gesture={swipeGesture}>
        {/* bg-[#FDF5E6] dark:bg-gray-900 */}
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-[#FDF5E6]'}`}>
          <View className="flex-1 items-center justify-center px-10">
            <Animated.View
              key={currentIndex}
              entering={(direction === 'forward' ? SlideInRight : SlideInLeft).duration(400)}
              exiting={(direction === 'forward' ? SlideOutLeft : SlideOutRight).duration(400)}
              className="items-center"
            >
              <View className="mb-10 items-center">
                <Image source={currentItem.image} resizeMode="contain" className="mb-10 h-24 w-24" />
                <View className={`rounded-full p-8 ${isDark ? 'bg-slate-800/50' : 'bg-gray-100'}`}>
                  <Icon size={80} color={colors.common.primary} />
                </View>
              </View>

              <Text className={`mb-4 text-center text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {currentItem.title}
              </Text>

              <Text className={`text-center text-lg leading-6 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
                {currentItem.description}
              </Text>
            </Animated.View>
          </View>

          <View className="p-10">
            {/* Pagination Dots */}
            <View className="mb-10 flex-row justify-center gap-2">
              {ONBOARDING_DATA.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${
                    index === currentIndex ? 'bg-primary w-8' : 'w-2'
                  } ${isDark ? 'bg-neutral-600' : 'bg-gray-300'}`}
                  style={index === currentIndex ? { backgroundColor: colors.common.primary } : undefined}
                />
              ))}
            </View>

            <View className="flex-row items-center justify-between">
              {currentIndex > 0 ? (
                <TouchableOpacity onPress={handleBack} className="flex-row items-center rounded-2xl px-6 py-4">
                  <ChevronLeft size={20} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} />
                  <Text className={`ml-1 font-semibold ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View className="w-20" />
              )}

              <TouchableOpacity
                onPress={handleNext}
                className="bg-primary flex-row items-center rounded-2xl px-8 py-4 shadow-lg active:scale-95"
                style={{ backgroundColor: colors.common.primary }}
              >
                <Text className="mr-2 text-lg font-bold text-white">
                  {currentIndex === ONBOARDING_DATA.length - 1 ? 'Get Started' : 'Next'}
                </Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
