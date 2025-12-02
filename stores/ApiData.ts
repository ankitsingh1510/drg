import { atom } from 'jotai';

export const newsAtom = atom(async () => {
  try {
    const res = await fetch(
      'https://us-central1-nandiraju-api.cloudfunctions.net/app/news?source=bing&q=genomics+cancer'
    );
    if (!res.ok) throw new Error('Failed to fetch trending topics');
    return await res.json(); // will be an array of todos
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
});

export const imagesAtom = atom(async () => {
  try {
    const res = await fetch(
      'https://api.unsplash.com/search/photos?page=1&query=cancer&per_page=20&client_id=WztAjjff7Z9mPXfGCNwmu8qPlVOIjuZaDErzoSy-5Tw'
    );
    if (!res.ok) throw new Error('Failed to fetch toimagesdos');
    return await res.json(); // will be an array of todos
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
});
