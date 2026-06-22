import { useMemo } from 'react';
import { Dimensions, useWindowDimensions } from 'react-native';
import { vars } from 'nativewind';

const BASE_WIDTH = 390;

const BASE_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export type FontSizeKey = keyof typeof BASE_SIZES;

function getFontScale(screenWidth: number): number {
  return Math.min(Math.max(screenWidth / BASE_WIDTH, 0.85), 1.25);
}

const { width: INITIAL_WIDTH } = Dimensions.get('window');
const STATIC_SCALE = getFontScale(INITIAL_WIDTH);

function rf(size: number): number {
  return Math.round(size * STATIC_SCALE);
}

export const fontSize: Record<FontSizeKey, number> = Object.fromEntries(
  (Object.entries(BASE_SIZES) as [FontSizeKey, number][]).map(([key, val]) => [key, rf(val)])
) as Record<FontSizeKey, number>;

export function useFontScaleVars() {
  const { width } = useWindowDimensions();
  const scale = getFontScale(width);

  return useMemo(
    () =>
      vars(
        Object.fromEntries(
          (Object.entries(BASE_SIZES) as [FontSizeKey, number][]).map(([key, val]) => [
            `--font-${key}`,
            `${Math.round(val * scale)}px`,
          ])
        ) as Record<string, string>
      ),
    [scale]
  );
}
