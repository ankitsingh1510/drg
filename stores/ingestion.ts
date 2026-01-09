import { atom } from 'jotai';

export const ingestionIdsAtom = atom<Set<number>>(new Set<number>());

export const addIngestionIdAtom = atom(null, (get, set, id: number) => {
  const prev = get(ingestionIdsAtom);
  const next = new Set(prev);
  next.add(id);
  set(ingestionIdsAtom, next);
});

export const removeIngestionIdAtom = atom(null, (get, set, id: number) => {
  const prev = get(ingestionIdsAtom);

  if (!prev.has(id)) return;

  const next = new Set(prev);
  next.delete(id);
  set(ingestionIdsAtom, next);
});

export const getIngestionIdsAtom = atom(get => {
  return get(ingestionIdsAtom);
});
