import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { ClipboardList, CogIcon, Home } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : 64;

type TabIconProps = {
  color: string;
  focused: boolean;
  icon: React.ReactNode;
};

function TabIcon({ color, focused, icon }: TabIconProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: focused ? 'rgba(218, 165, 33, 0.12)' : 'transparent',
      }}
    >
      {icon}
    </View>
  );
}

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
  const INACTIVE_COLOR = isDark ? '#9ca3af' : '#9ca3af';

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
          title: 'Home',
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? '#111827' : '#FDF5E6',
          },
          headerTintColor: isDark ? '#f9fafb' : '#111827',
          headerTitleStyle: {
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 20,
          },
          headerShadowVisible: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              icon={<Home size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? '#111827' : '#FDF5E6',
          },
          headerTintColor: isDark ? '#f9fafb' : '#111827',
          headerTitleStyle: {
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 20,
          },
          headerShadowVisible: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              icon={<ClipboardList size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? '#111827' : '#FDF5E6',
          },
          headerTintColor: isDark ? '#f9fafb' : '#111827',
          headerTitleStyle: {
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 20,
          },
          headerShadowVisible: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              icon={<CogIcon size={22} color={color} strokeWidth={focused ? 2.4 : 1.8} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}
