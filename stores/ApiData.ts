import { atom } from 'jotai';
import { atomWithRefresh } from 'jotai/utils';

export const newsAtom = atomWithRefresh(async () => {
  try {
    const res = await fetch(
      'https://us-central1-nandiraju-api.cloudfunctions.net/app/news?source=bing&q=genomics+cancer'
    );
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
    return await res.json();
  } catch {
    return null;
  }
});
