import React, { useState } from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { ChevronLeft, ChevronRight, FileText, MessageSquare } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { hasSeenOnboardingAtom } from '@/stores/onboarding';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    title: 'Analyze Reports',
    description: 'Upload your medical reports and get instant AI-powered summaries and insights tailored for you.',
    icon: <FileText size={80} color={colors.common.primary} />,
    image: require('@/assets/images/DrG-logo.png'),
  },
  {
    title: 'Voice & Chat',
    description: 'Talk or chat with Dr.G to ask questions about your health and get real-time responses anytime.',
    icon: <MessageSquare size={80} color={colors.common.primary} />,
    image: require('@/assets/images/DrG-logo.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [, setHasSeenOnboarding] = useAtom(hasSeenOnboardingAtom);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setDirection('forward');
      setCurrentIndex(currentIndex + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace('/login');
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection('backward');
      setCurrentIndex(currentIndex - 1);
    }
  };

  const swipeGesture = Gesture.Pan()
    .onEnd(e => {
      if (e.translationX < -50) {
        runOnJS(handleNext)();
      } else if (e.translationX > 50) {
        runOnJS(handleBack)();
      }
    })
    .runOnJS(true);

  const currentItem = ONBOARDING_DATA[currentIndex];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={swipeGesture}>
        <SafeAreaView className="flex-1 bg-[#0f172a]">
          <View className="flex-1 items-center justify-center px-10">
            <Animated.View
              key={currentIndex}
              entering={(direction === 'forward' ? SlideInRight : SlideInLeft).duration(400)}
              exiting={(direction === 'forward' ? SlideOutLeft : SlideOutRight).duration(400)}
              className="items-center"
            >
              <View className="mb-10 items-center justify-center">
                <Image source={currentItem.image} className="mb-10 h-24 w-24" resizeMode="contain" />
                <View className="mb-8 rounded-full bg-slate-800/50 p-8">{currentItem.icon}</View>
              </View>

              <Text className="mb-4 text-center text-3xl font-bold text-white">{currentItem.title}</Text>

              <Text className="text-center text-lg leading-6 text-slate-400">{currentItem.description}</Text>
            </Animated.View>
          </View>

          <View className="p-10">
            {/* Pagination Dots */}
            <View className="mb-10 flex-row justify-center gap-2">
              {ONBOARDING_DATA.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${index === currentIndex ? 'w-8 bg-amber-500' : 'w-2 bg-slate-700'}`}
                />
              ))}
            </View>

            <View className="flex-row items-center justify-between">
              {currentIndex > 0 ? (
                <TouchableOpacity onPress={handleBack} className="flex-row items-center rounded-2xl px-6 py-4">
                  <ChevronLeft size={20} color="#94a3b8" />
                  <Text className="ml-1 font-semibold text-slate-400">Back</Text>
                </TouchableOpacity>
              ) : (
                <View className="w-20" />
              )}

              <TouchableOpacity
                onPress={handleNext}
                className="flex-row items-center rounded-2xl px-8 py-4 shadow-lg active:scale-95"
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
