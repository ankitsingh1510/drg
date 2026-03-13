import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const setFcmToken = (token: string) => {
  storage.set('fcmToken', token);
};

export const getFcmToken = (): string | null => {
  return storage.getString('fcmToken') ?? null;
};

export const hasSeenNotificationPermission = (): boolean => {
  return storage.getBoolean('hasSeenNotificationPermission') ?? false;
};

export const setHasSeenNotificationPermission = (value: boolean) => {
  storage.set('hasSeenNotificationPermission', value);
};
