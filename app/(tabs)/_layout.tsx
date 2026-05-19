import React, { useEffect } from 'react';
import { Dimensions, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MessagesSquare } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import LandingScreen from './home';

const TAB_BAR_BASE_HEIGHT = Platform.select({
  ios: 50,
  default: 56,
});
const TAB_BAR_TOP_PADDING = 8;
const TAB_BAR_MIN_BOTTOM_PADDING = Platform.select({
  ios: 12,
  default: 8,
});
const TAB_BAR_ITEM_VERTICAL_PADDING = Platform.select({
  ios: 4,
  default: 0,
});

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_PADDING!);

  const tabBarStyle = {
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
    borderTopWidth: 1,
    height: TAB_BAR_BASE_HEIGHT + TAB_BAR_TOP_PADDING + bottomPadding,
    paddingBottom: bottomPadding,
    paddingTop: TAB_BAR_TOP_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 12,
  };

  const ACTIVE_COLOR = '#daa521';
  const INACTIVE_COLOR = '#9ca3af';

  const sharedHeaderOptions = {
    headerShown: true,
    headerTransparent: true,
    headerBackground: () => (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? 'rgba(17,24,39,0.82)' : 'rgba(253,245,230,0.82)',
        }}
      />
    ),
    headerTintColor: isDark ? '#f9fafb' : '#111827',
    headerTitleStyle: {
      fontFamily: 'Outfit_600SemiBold',
      fontSize: 20,
    },
    headerShadowVisible: false,
  } as any;

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 900 }), withTiming(0.9, { duration: 900 })),
      -1, // infinite
      true // reverse on repeat
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
      ],
    };
  });

  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
  const BUTTON_SIZE = 60;
  // Initial position is fixed at the bottom-right corner (bottom: 62, right: 32)
  const translateX = useSharedValue(SCREEN_W - BUTTON_SIZE - 32);
  const translateY = useSharedValue(SCREEN_H - BUTTON_SIZE - 62 - (insets.bottom || 0));
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
    })
    .onUpdate(e => {
      translateX.value = Math.max(0, Math.min(SCREEN_W - BUTTON_SIZE, startX.value + e.translationX));
      translateY.value = Math.max(0, Math.min(SCREEN_H - BUTTON_SIZE, startY.value + e.translationY));
    })
    .onEnd(() => {
      isDragging.value = false;
      // Snap to nearest horizontal edge
      const snapX = translateX.value < SCREEN_W / 2 ? 12 : SCREEN_W - BUTTON_SIZE - 12;
      translateX.value = withSpring(snapX, { damping: 15, stiffness: 120 });
    });

  const dragStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: translateX.value,
    top: translateY.value,
    zIndex: 99,
  }));

  return (
    <>
      {/* <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle,
          tabBarActiveTintColor: ACTIVE_COLOR,
          tabBarInactiveTintColor: INACTIVE_COLOR,
          tabBarLabelStyle: {
            fontSize: 11,
            fontFamily: 'Outfit_500Medium',
            marginTop: 0,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: TAB_BAR_ITEM_VERTICAL_PADDING,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            headerShown: false,
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
        name="reports_list"
        options={{
          ...sharedHeaderOptions,
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={23} color={color} />
          ),
        }}
        />
        <Tabs.Screen
          name="scribe"
          options={{
            ...sharedHeaderOptions,
            title: 'Scribe',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'mic' : 'mic-outline'} size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            ...sharedHeaderOptions,
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={23} color={color} />
            ),
          }}
        />
      </Tabs> */}
      <LandingScreen />
      <GestureDetector gesture={panGesture}>
        <Animated.View entering={FadeInDown.delay(1000).springify()} style={dragStyle}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Linking.openURL('https://wa.me/919022137932?text=I%20need%20help');
            }}
          >
            <Animated.View style={animatedStyle}>
              <Image source={require('../../assets/wp.png')} style={{ width: 60, height: 60 }} contentFit="contain" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

const styles = StyleSheet.create({
  chatBot: {
    position: 'absolute',
    bottom: 62,
    right: 32,
    zIndex: 99,
  },
  chatIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.common.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
