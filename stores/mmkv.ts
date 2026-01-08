import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export const setFcmToken = (token: string) => {
  storage.set('fcmToken', token);
};

export const getFcmToken = (): string | null => {
  return storage.getString('fcmToken');
};
