import { atom } from 'jotai';
import { storage } from './mmkv';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

// Load saved theme from storage or default to 'dark'
const savedTheme = storage.getString(THEME_STORAGE_KEY) as ThemeMode | undefined;

export const themeAtom = atom<ThemeMode>(savedTheme || 'dark');

// Helper to save theme to storage
export const saveTheme = (theme: ThemeMode) => {
  storage.set(THEME_STORAGE_KEY, theme);
};
