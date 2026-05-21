import React, { useCallback, useMemo } from 'react';
import { Image, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAtom } from 'jotai';
import { ArrowRight } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import { hasSeenOnboardingAtom } from '@/stores/onboarding';

const DURATION = 350;
const EASING = Easing.out(Easing.cubic);

const ONBOARDING_DATA = [
  {
    title: 'Manage Patients Effortlessly',
    description: 'Access patient reports, track progress, and stay updated — all in one place',
    image: require('@/assets/onboarding/1.png'),
  },
  {
    title: 'Simplified Report Interpretation',
    description: 'Understand complex genomic reports with clear, actionable insights',
    image: require('@/assets/onboarding/2.png'),
  },
  {
    title: 'Interact with AI Clinical Insights',
    description:
      'Ask clinical questions, explore AI-generated insights, and interact directly with reports using DrG AI',
    image: require('@/assets/onboarding/3.png'),
  },
];

const N = ONBOARDING_DATA.length;

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [, setHasSeenOnboarding] = useAtom(hasSeenOnboardingAtom);

  // Tracks which page we're on — stored as a shared value so the
  // dot indicator can update without a JS re-render if needed.
  // We also keep a React state copy only for the nav buttons / isLast check.
  const currentIndex = useSharedValue(0);
  const [pageIndex, setPageIndex] = React.useState(0);

  // The strip translateX: page 0 → 0, page 1 → -width, page 2 → -2*width
  const translateX = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  const goTo = useCallback(
    (to: number) => {
      'worklet';
      if (isAnimating.value || to < 0 || to >= N) return;
      isAnimating.value = true;
      currentIndex.value = to;
      translateX.value = withTiming(-to * width, { duration: DURATION, easing: EASING }, finished => {
        if (finished) {
          isAnimating.value = false;
          runOnJS(setPageIndex)(to);
        }
      });
    },
    [width, currentIndex, translateX, isAnimating]
  );

  const handleNext = useCallback(() => {
    if (pageIndex < N - 1) {
      goTo(pageIndex + 1);
    } else {
      setHasSeenOnboarding(true);
      router.replace('/login');
    }
  }, [pageIndex, goTo, router, setHasSeenOnboarding]);

  const handleSkip = useCallback(() => {
    setHasSeenOnboarding(true);
    router.replace('/login');
  }, [router, setHasSeenOnboarding]);

  const handleBack = useCallback(() => {
    goTo(pageIndex - 1);
  }, [pageIndex, goTo]);

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .onEnd(e => {
          if (e.translationX < -50) runOnJS(handleNext)();
          else if (e.translationX > 50) runOnJS(handleBack)();
        })
        .runOnJS(true),
    [handleNext, handleBack]
  );

  // The whole strip moves together — no per-slide state changes ever
  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const isLast = pageIndex === N - 1;

  return (
    <GestureHandlerRootView className="flex-1">
      <GestureDetector gesture={swipeGesture}>
        <View className="flex-1 bg-white">
          {/* ── Image strip ── */}
          <View className="overflow-hidden" style={{ flex: 60 }}>
            <Animated.View style={[stripStyle, { flexDirection: 'row', width: width * N, height: '100%' }]}>
              {ONBOARDING_DATA.map((item, i) => (
                <View key={i} style={{ width, height: '100%' }} className="items-center justify-center">
                  <Image source={item.image} resizeMode="contain" style={{ width: '90%', height: '90%' }} />
                </View>
              ))}
            </Animated.View>
          </View>

          {/* ── Bottom panel ── */}
          <SafeAreaView edges={['bottom']} className="rounded-t-3xl bg-[#1A365D] px-7 pb-2 pt-6" style={{ flex: 42 }}>
            {/* Dots */}
            <View className="mb-7 flex-row gap-2">
              {ONBOARDING_DATA.map((_, index) => (
                <View
                  key={index}
                  className="mt-6 h-1.5 rounded-full"
                  style={{
                    width: index === pageIndex ? 36 : 28,
                    backgroundColor: index === pageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </View>

            {/* Text strip — mirrors the image strip exactly */}
            <View style={{ overflow: 'hidden', flex: 1 }}>
              <Animated.View style={[stripStyle, { flexDirection: 'row', width: width * N }]}>
                {ONBOARDING_DATA.map((item, i) => (
                  <View key={i} style={{ width }}>
                    <AppText weight="bold" className="mb-3 text-2xl leading-9 text-white">
                      {item.title}
                    </AppText>
                    <AppText weight="regular" className="text-base leading-6 text-white/60" style={{ width: '80%' }}>
                      {item.description}
                    </AppText>
                  </View>
                ))}
              </Animated.View>
            </View>

            {/* Nav buttons */}
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
