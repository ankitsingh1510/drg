import { apiFetch } from './fetchClient';

interface ConfigResponse {
  success?: boolean;
  message?: string;
  data?: {
    showVideoAvatar?: boolean;
  };
  error?: unknown;
}

export const configAPI = {
  getConfig: async (): Promise<{ showVideoAvatar: boolean }> => {
    try {
      const response = await apiFetch(`${process.env.EXPO_PUBLIC_AMPLIFY_URL}/drg/api/config`, {
        method: 'GET',
      });

      const payload = response.data as ConfigResponse;
      return {
        showVideoAvatar: payload?.data?.showVideoAvatar ?? true,
      };
    } catch (error) {
      console.error('Error loading chat config:', error);
      return { showVideoAvatar: true };
    }
  },
};
