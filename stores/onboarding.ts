import { atomWithStorage } from 'jotai/utils';
import { storage } from './mmkv';

const mmkvStorage = {
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  },
  setItem: (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

export const hasSeenOnboardingAtom = atomWithStorage('hasSeenOnboarding', false, mmkvStorage);
