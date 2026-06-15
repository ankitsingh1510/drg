import Constants from 'expo-constants';

type AppExtra = {
  apiUrl?: string;
  gqlUrl?: string;
  appEnv?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

export const API_BASE_URL = extra.apiUrl || process.env.EXPO_PUBLIC_API_BASE_URL || '';
export const GQL_BASE_URL = extra.gqlUrl || process.env.EXPO_PUBLIC_GQL_URL || '';
export const APP_ENV = extra.appEnv || process.env.APP_ENV || 'development';
