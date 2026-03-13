import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : 64;

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tabBarStyle = {
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderTopColor: isDark ? '#1f2937' : '#e5e7eb',
    borderTopWidth: 1,
    height: TAB_BAR_HEIGHT,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
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
      fontFamily: 'Poppins_600SemiBold',
      fontSize: 20,
    },
    headerShadowVisible: false,
  } as any;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Poppins_500Medium',
          marginTop: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          ...sharedHeaderOptions,
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          ...sharedHeaderOptions,
          title: 'Patients',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'clipboard' : 'clipboard-outline'} size={23} color={color} />
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
    </Tabs>
  );
}
