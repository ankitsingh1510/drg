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
    storage.delete(key);
  },
};

export const showPatientsButtonAtom = atomWithStorage('showPatientsButton', false, mmkvStorage);
export const showExtensionsButtonAtom = atomWithStorage('showExtensionsButton', false, mmkvStorage);
