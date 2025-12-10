import { router } from 'expo-router';
import { storage } from '@/stores/mmkv';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const TIMEOUT = 120000; // 2 min timeout as per axios

const withTimeout = <T>(promise: Promise<T>, ms: number) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, ms);

    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    // For REQUEST INTERCEPTOR
    const token = storage.getString('token') ?? null;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchPromise = fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Applied timeout to fetch
    const response = await withTimeout(fetchPromise, TIMEOUT);

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

    let data: any = null;
    if (contentType?.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      data = await response.text().catch(() => null);
    }

    if (!response.ok) {
      console.log('API Error:', {
        status: response.status,
        url: endpoint,
        data,
      });

      throw {
        status: response.status,
        message: 'Request failed',
        data,
      };
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
      throw {
        status: 0,
        message: 'Network timeout — please try again.',
      };
    }

    throw error;
  }
}
