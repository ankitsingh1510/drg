import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

type ToastOptions = {
  text1: string;
  text2?: string;
  visibilityTime?: number;
};

export const toast = {
  success: (text1: string, text2?: string, visibilityTime?: number) =>
    Toast.show({ type: 'success', text1, text2, visibilityTime }),

  error: (text1: string, text2?: string, visibilityTime?: number) =>
    Toast.show({ type: 'error', text1, text2, visibilityTime }),

  info: (text1: string, text2?: string, visibilityTime?: number) =>
    Toast.show({ type: 'info', text1, text2, visibilityTime }),

  show: (options: ToastOptions & { type?: ToastType }) => Toast.show({ type: 'info', ...options }),
};
