import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { useAtom } from 'jotai';
import { useColorScheme } from 'nativewind';
import { saveTheme, themeAtom } from '@/stores/theme';

export function useThemeSync() {
  const [theme, setThemeState] = useAtom(themeAtom);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    // Apply the theme to nativewind
    setColorScheme(theme);
  }, [theme]);

  // Custom setter that also saves to storage
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return { theme, setTheme, toggleTheme };
}
