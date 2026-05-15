import React, { useEffect } from 'react';
import { Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MessagesSquare } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

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
      withSequence(withTiming(1.2, { duration: 1000 }), withTiming(0.9, { duration: 1000 })),
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

  return (
    <>
      <Tabs
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
        {/* <Tabs.Screen
        name="reports_list"
        options={{
          ...sharedHeaderOptions,
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={23} color={color} />
          ),
        }}
      /> */}
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
      </Tabs>
      <Animated.View entering={FadeInDown.delay(1000).springify()} style={styles.chatBot}>
        <TouchableOpacity
          style={styles.chatIcon}
          activeOpacity={0.8}
          onPress={() => {
            Linking.openURL('https://wa.me/919022137932');
          }}
        >
          <Animated.View style={animatedStyle}>
            <MessagesSquare size={28} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  chatBot: {
    position: 'absolute',
    bottom: 112,
    right: 32,
    zIndex: 99,
  },
  chatIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.common.primary,
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
