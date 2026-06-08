import React, { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';
import tips from '../../constants/tips';

const ICON_NAME_MAP = {
  Activity: 'pulse-outline',
  AlertCircle: 'alert-circle-outline',
  AlertTriangle: 'alert-outline',
  BarChart3: 'bar-chart-outline',
  Brain: 'analytics-outline',
  Calendar: 'calendar-outline',
  Check: 'checkmark',
  CheckCircle2: 'checkmark-circle-outline',
  ClipboardList: 'clipboard-outline',
  Clock: 'time-outline',
  Copy: 'copy-outline',
  Dna: 'git-network-outline',
  FileText: 'document-text-outline',
  FlaskConical: 'flask-outline',
  Lightbulb: 'bulb-outline',
  Microscope: 'beaker-outline',
  RefreshCcw: 'refresh-outline',
  Search: 'search-outline',
  Shield: 'shield-checkmark-outline',
  Target: 'locate-outline',
  TestTube2: 'flask-outline',
  TrendingUp: 'trending-up-outline',
  Zap: 'flash-outline',
} as const;

type IconName = keyof typeof ICON_NAME_MAP;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
const DEFAULT_ICON: IconName = 'Lightbulb';

const isIconName = (icon?: string): icon is IconName => {
  if (!icon) return false;
  return icon in ICON_NAME_MAP;
};

const getIconName = (icon?: string): IoniconName => {
  if (isIconName(icon)) {
    return ICON_NAME_MAP[icon];
  }
  return ICON_NAME_MAP[DEFAULT_ICON];
};

type TipItem = {
  tip: string;
  icon?: string;
};

export default function TipOfTheDay() {
  const getRandomTip = useCallback((excludeTip?: TipItem) => {
    if (!Array.isArray(tips)) return { tip: 'No tips available', icon: DEFAULT_ICON };
    const availableTips = excludeTip ? tips.filter((t: TipItem) => t.tip !== excludeTip.tip) : tips;
    const pool = availableTips.length > 0 ? availableTips : tips;
    return pool[Math.floor(Math.random() * pool.length)] as TipItem;
  }, []);

  const [currentTip, setCurrentTip] = useState(getRandomTip());
  const [refreshKey, setRefreshKey] = useState(0);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconName = getIconName(currentTip.icon);

  const handleNextTip = useCallback(() => {
    setCurrentTip(prev => getRandomTip(prev));
    setRefreshKey(prev => prev + 1);
  }, [getRandomTip]);

  return (
    <View
      className="mx-4 mb-4 rounded-2xl border p-4"
      style={{
        backgroundColor: isDark ? colors.dark.cardBackground : colors.light.cardBackground,
        borderColor: isDark ? '#374151' : '#EBEBEB',
      }}
    >
      <View className="mb-[14px] flex-row items-center justify-between">
        <View className="flex-row items-center">
          <AppText className="font-outfit-semibold text-[15px]" style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
            <Ionicons name={'bulb-outline'} size={15} color={isDark ? colors.dark.text : colors.common.primary} />
            {'  '}
            Tip of the Day
          </AppText>
        </View>
        <View className="rounded-[20px] px-2.5 py-1" style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
          <AppText
            className="font-outfit text-[10px] tracking-[0.5px]"
            style={{ color: isDark ? '#d1d5db' : '#374151' }}
          >
            Medical Insight
          </AppText>
        </View>
      </View>

      <Animated.View
        key={`tip-${refreshKey}`}
        entering={FadeInRight.damping(10)}
        exiting={FadeOutLeft.duration(100)}
        className="flex-row items-start gap-3"
      >
        <View
          className="h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: isDark ? '#31363c' : '#f1f5f9' }}
        >
          <Ionicons name={iconName} size={20} color={isDark ? '#93c5fd' : '#2563eb'} />
        </View>

        <View className="flex-1">
          <AppText className="font-outfit text-base leading-[22px]" style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
            {currentTip.tip}
          </AppText>
        </View>
      </Animated.View>

      <TouchableOpacity
        onPress={handleNextTip}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
        className="mt-4 items-end"
      >
        <AppText className="text-sm" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
          Next tip <Ionicons name={'arrow-forward'} size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
