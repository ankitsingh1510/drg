/**
 * Theme colors for the application
 * Centralized color definitions for consistent theming across light and dark modes
 */

export const colors = {
  // Light mode colors
  light: {
    background: '#FDF5E6', // Old Lace
    cardBackground: '#FFFFFF',
    text: '#1F2937', // Gray 800
    textSecondary: '#64748b', // Slate 500
    textTertiary: '#9CA3AF', // Gray 400
    border: '#E5E7EB', // Gray 200
  },

  // Dark mode colors
  dark: {
    background: '#111827', // Gray 900
    cardBackground: '#1f2937', // Gray 800
    text: '#f9fafb', // Gray 50
    textSecondary: '#d1d5db', // Gray 300
    textTertiary: '#9ca3af', // Gray 400
    border: '#374151', // Gray 700
  },

  // Gradient colors
  gradients: {
    light: ['#FDF5E6', '#FDF5E6', '#FFF8DC'] as const,
    dark: ['#1f2937', '#111827', '#0f172a'] as const,
  },

  // Common/Brand colors (same in both modes)
  common: {
    primary: '#daa521', // Goldenrod
    accent: '#003366', // Navy blue
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#60a5fa', // Blue for info/switches
  },
} as const;

export type ColorScheme = 'light' | 'dark';

/**
 * Helper function to get colors based on current color scheme
 */
export const getColors = (scheme: ColorScheme) => ({
  ...colors.common,
  ...(scheme === 'dark' ? colors.dark : colors.light),
  gradient: scheme === 'dark' ? colors.gradients.dark : colors.gradients.light,
});
