import { atom } from 'jotai';
import { atomWithRefresh } from 'jotai/utils';

type UnsplashImage = {
  id: string;
  alt_description: string | null;
  description: string | null;
  urls: {
    small?: string;
    regular?: string;
  };
};

type UnsplashSearchResponse = {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
};

export const newsAtom = atomWithRefresh(async () => {
  try {
    const res = await fetch(process.env.EXPO_PUBLIC_NEWS_API_URL as string, {
      headers: { 'x-api-key': process.env.EXPO_PUBLIC_NEWS_API_KEY as string },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
});

export const imagesAtom = atom(async () => {
  try {
    const res = await fetch(
      'https://api.unsplash.com/search/photos?page=1&query=cancer&per_page=20&client_id=WztAjjff7Z9mPXfGCNwmu8qPlVOIjuZaDErzoSy-5Tw'
    );
    if (!res.ok) return null;
    const data = (await res.json()) as UnsplashSearchResponse;
    return data;
  } catch {
    return null;
  }
});
