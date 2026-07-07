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
      className={`max-w-[48%] flex-1 flex-row items-center justify-center p-2`}
    >
      {comingSoon && (
        <View className="absolute -top-[10px] z-10">
          <AppText className="text-xs tracking-[0.5px] text-[#F59E0B]">COMING SOON</AppText>
        </View>
      )}
      <TouchableOpacity
        className={`h-[150px] w-full rounded-2xl p-4 ${comingSoon ? 'opacity-70' : ''}`}
        style={{
          backgroundColor: color || '#FFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 3,
        }}
        onPress={!comingSoon ? onPress : undefined}
        activeOpacity={comingSoon ? 1 : 0.8}
        accessibilityLabel={label}
        accessibilityHint={comingSoon ? 'Coming soon' : subtitle}
        accessibilityRole="button"
        disabled={comingSoon}
      >
        <View
          className={`mb-3 h-[56px] w-[56px] items-center justify-center rounded-2xl ${comingSoon ? 'opacity-80' : ''}`}
          style={{ backgroundColor: isDark ? colors.dark.cardBackground : '#FFFFFF' }}
        >
          {icon}
        </View>

        <AppText className="mt-2 text-[16px] font-semibold" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
          {label}
        </AppText>
        {subtitle ? (
          <AppText
            className="mt-1 max-w-[95%] text-[14px] leading-[18px]"
            style={{ color: isDark ? '#9ca3af' : '#6B7280' }}
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

  return (
    <View className="mx-4 mb-2 px-1 pb-1 pt-1">
      <View className="mb-3 flex-row items-center">
        {headerIcon && (
          <Ionicons
            name={headerIcon as any}
            size={18}
            color={isDark ? colors.dark.text : colors.common.primary}
            style={{ marginRight: 8 }}
          />
        )}
        <AppText className="text-[18px] font-semibold" style={{ color: isDark ? '#f3f4f6' : '#111827' }}>
          {title}
        </AppText>
      </View>

      <View className={`w-full flex-row pb-1 ${layout === 'grid' ? 'flex-wrap justify-between' : ''}`}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <HomeTile {...item} layout={layout} index={index} />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};
