import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import AppText from '@/components/ui/AppText';
import { colors } from '@/constants/colors';

export interface HomeItem {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  color?: string;
  onPress: () => void;
  comingSoon?: boolean;
}

export interface HomeSectionProps {
  title: string;
  headerIcon: string;
  items: HomeItem[];
  layout?: 'row' | 'grid';
  cardBackground?: string;
}

export const TileDivider: React.FC = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseColor = isDark ? '#718098' : '#8aa0c7';
  return (
    <Svg height="100%" width={1}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={baseColor} stopOpacity="0" />
          <Stop offset="50%" stopColor={baseColor} stopOpacity="1" />
          <Stop offset="100%" stopColor={baseColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="2" height="100%" fill="url(#grad)" />
    </Svg>
  );
};

const HomeTile: React.FC<HomeItem & { layout: 'row' | 'grid'; index: number }> = ({
  label,
  subtitle,
  icon,
  color,
  comingSoon = false,
  onPress,
  layout,
  index,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isRow = layout === 'row';

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 100)
        .duration(600)
        .springify()}
      className="max-w-[33%] flex-1 flex-row items-center justify-center"
    >
      {comingSoon && (
        <View className="absolute -top-[10px] z-10">
          <AppText className="text-xs tracking-[0.5px] text-[#F59E0B]">COMING SOON</AppText>
        </View>
      )}
      <TouchableOpacity
        className={`items-center py-3 ${isRow ? 'px-1' : 'min-w-[45%] flex-1 px-2'} ${comingSoon ? 'opacity-70' : ''}`}
        onPress={!comingSoon ? onPress : undefined}
        activeOpacity={comingSoon ? 1 : 0.8}
        accessibilityLabel={label}
        accessibilityHint={comingSoon ? 'Coming soon' : subtitle}
        accessibilityRole="button"
        disabled={comingSoon}
      >
        <View
          className={`mb-2 h-[52px] w-[52px] items-center justify-center rounded-xl ${comingSoon ? 'opacity-80' : ''}`}
          style={{ backgroundColor: color || '#91A3B0' }}
        >
          {icon}
        </View>

        <AppText className="mb-0.5 text-center text-base" style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
          {label}
        </AppText>
        {subtitle ? (
          <AppText
            className="mt-1.5 max-w-[90%] text-center text-sm leading-[14px]"
            style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
          >
            {subtitle}
          </AppText>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const HomeSection: React.FC<HomeSectionProps> = ({
  title,
  headerIcon,
  items,
  layout = 'row',
  cardBackground,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bgColor = cardBackground || (isDark ? colors.dark.cardBackground : colors.light.cardBackground);

  return (
    <View
      className="mx-4 mb-4 rounded-2xl border px-2.5 pb-2 pt-4"
      style={{ backgroundColor: bgColor, borderColor: isDark ? '#374151' : '#EBEBEB' }}
    >
      <View className="mb-3 flex-row items-center px-1">
        {headerIcon && (
          <Ionicons
            name={headerIcon as any}
            size={18}
            color={isDark ? colors.dark.text : colors.common.primary}
            style={{ marginRight: 8 }}
          />
        )}
        <AppText className="text-base" style={{ color: isDark ? '#f3f4f6' : '#1f2937' }}>
          {title}
        </AppText>
      </View>

      <View className={`w-full flex-row items-start pb-1 ${layout === 'grid' ? 'flex-wrap gap-3' : ''}`}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <HomeTile {...item} layout={layout} index={index} />
            {index < items.length - 1 && <TileDivider />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};
