import React, { useCallback, useMemo, useState } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { ArrowRight } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { hasSeenOnboardingAtom } from '@/stores/onboarding';

const ONBOARDING_DATA = [
  {
    title: 'Manage Patients Effortlessly',
    description: 'Access patient reports, track progress, and stay updated—all in one place',
    image: require('@/assets/onboarding/on.webp'),
  },
  {
    title: 'Simplified Report Interpretation',
    description: 'Understand complex genomic reports with clear, actionable insights',
    image: require('@/assets/onboarding/on1.webp'),
  },
  {
    title: 'Capture Every Consultation',
    description: 'Record patient discussions securely and revisit them anytime',
    image: require('@/assets/onboarding/on2.webp'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [, setHasSeenOnboarding] = useAtom(hasSeenOnboardingAtom);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const handleNext = useCallback(() => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      setDirection('forward');
      setCurrentIndex(prev => prev + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace('/login');
    }
  }, [currentIndex, router, setHasSeenOnboarding]);

  const handleSkip = useCallback(() => {
    setHasSeenOnboarding(true);
    router.replace('/login');
  }, [router, setHasSeenOnboarding]);

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
  const isLast = currentIndex === ONBOARDING_DATA.length - 1;

  return (
    <GestureHandlerRootView className="flex-1">
      <GestureDetector gesture={swipeGesture}>
        <View className="flex-1">
          <View className="items-center justify-center overflow-hidden bg-white" style={{ flex: 58 }}>
            <Animated.View
              key={currentIndex}
              entering={(direction === 'forward' ? SlideInRight : SlideInLeft).duration(350)}
              exiting={(direction === 'forward' ? SlideOutLeft : SlideOutRight).duration(350)}
              className="h-full w-full items-center justify-center"
            >
              <Image source={currentItem.image} resizeMode="contain" className="h-[90%] w-[90%]" />
            </Animated.View>
          </View>

          <SafeAreaView edges={['bottom']} className="bg-[#1A365D] px-7 pb-2 pt-8" style={{ flex: 42 }}>
            <View className="mb-7 flex-row gap-2">
              {ONBOARDING_DATA.map((_, index) => (
                <View
                  key={index}
                  className="mt-6 h-1.5 rounded-full"
                  style={{
                    width: index === currentIndex ? 36 : 28,
                    backgroundColor: index === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </View>

            <Animated.View
              key={`text-${currentIndex}`}
              entering={(direction === 'forward' ? SlideInRight : SlideInLeft).duration(350)}
              exiting={(direction === 'forward' ? SlideOutLeft : SlideOutRight).duration(350)}
            >
              <AppText weight="bold" className="mb-3 text-2xl leading-9 text-white">
                {currentItem.title}
              </AppText>
              <AppText weight="regular" className="text-sm leading-6 text-white/60">
                {currentItem.description}
              </AppText>
            </Animated.View>

            <View className="mb-8 mt-auto flex-row items-center justify-between px-2 pt-2">
              {!isLast ? (
                <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
                  <AppText weight="medium" className="text-base text-white">
                    Skip
                  </AppText>
                </TouchableOpacity>
              ) : (
                <View />
              )}
              <View className="h-20 w-20 rounded-full border-2 border-white">
                <TouchableOpacity
                  onPress={handleNext}
                  activeOpacity={0.85}
                  className="absolute inset-[4px] items-center justify-center rounded-full bg-white"
                >
                  <ArrowRight size={28} color={colors.common.navy} />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
