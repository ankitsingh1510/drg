import { router } from 'expo-router';
import { storage } from '@/stores/mmkv';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  try {
    // For REQUEST INTERCEPTOR
    // Check if path is endpoint or full url
    const isFull = path.startsWith('http://') || path.startsWith('https://');
    const finalURL = isFull ? path : `${BASE_URL}${path}`;

    const token = storage.getString('token') ?? null;

    const headers: HeadersInit = {
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!headers['Timezone']) {
      headers['Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    const response = await fetch(finalURL, {
      ...options,
      headers,
    });

    // For RESPONSE INTERCEPTOR
    if (response.status === 401) {
      console.log('Authentication error — logging out.');

      let unauthorizedData: any = null;
      const unauthorizedContentType = response.headers.get('content-type');
      if (unauthorizedContentType?.includes('application/json')) {
        unauthorizedData = await response.json().catch(() => null);
      }

      const isLoginRequest = finalURL.includes('/api/token');
      if (!isLoginRequest) {
        storage.clearAll();
        setTimeout(() => {
          router.replace('/' as any);
        }, 500);
      }

      const rawMessage = unauthorizedData?.description || 'Unauthorized';
      const errorMessage = rawMessage.includes(':: ') ? rawMessage.split(':: ').pop()!.trim() : rawMessage;
      throw { status: 401, message: errorMessage, data: unauthorizedData };
    }

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType?.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }

    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        url: finalURL,
        data,
      });

      throw { status: response.status, message: 'Request failed', data };
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error: any) {
    console.error('Fetch Error:', error);

    // NETWORK / TIMEOUT ERROR
    if (error.message === 'Request timed out') {
      throw { status: 0, message: 'Network timeout — please try again.' };
    }

    throw error;
  }
}
