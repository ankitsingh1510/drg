import { router } from 'expo-router';
import { storage } from '@/stores/mmkv';
import { analyticsService } from './analytics';

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

      storage.clearAll();

      setTimeout(() => {
        router.replace('/' as any);
      }, 500);

      throw new Error('Unauthorized');
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
      // Log API error to analytics
      await analyticsService.logApiError(path, response.status, data?.message || data?.error || 'Request failed', {
        method: options.method || 'GET',
        url: finalURL,
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
      // Log network failure
      await analyticsService.logNetworkFailure({
        endpoint: path,
        error_message: 'Request timed out',
      });

      throw { status: 0, message: 'Network timeout — please try again.' };
    }

    // If it's an API error (has status), we already logged it above
    // For other errors (like network errors), log them here
    if (!error.status) {
      await analyticsService.logNetworkFailure({
        endpoint: path,
        error_message: error.message || 'Network error',
        error_type: error.name || 'unknown',
      });
    }

    throw error;
  }
}
