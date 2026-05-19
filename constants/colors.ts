export type ColorScheme = 'light' | 'dark';

export const colors = {
  light: {
    background: '#FDF5E6',
    cardBackground: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#64748b',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
  },
  dark: {
    background: '#111827',
    cardBackground: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    border: '#374151',
  },
  gradients: {
    light: ['#FDF5E6', '#FDF5E6', '#FFF8DC'] as const,
    dark: ['#1f2937', '#111827', '#0f172a'] as const,
  },
  common: {
    primary: '#daa521',
    accent: '#003366',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#60a5fa',
    navy: '#1A365D',
  },
} as const;

export const getColors = (scheme: ColorScheme) => ({
  ...colors.common,
  ...(scheme === 'dark' ? colors.dark : colors.light),
  gradient: scheme === 'dark' ? colors.gradients.dark : colors.gradients.light,
});
