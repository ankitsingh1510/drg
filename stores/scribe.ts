import { atom } from 'jotai';
import { ScribeSession } from '@/types/scribe';
import { storage } from './mmkv';

const SCRIBE_SESSIONS_KEY = 'scribe-sessions';

// Load saved sessions from storage
const savedSessions = storage.getString(SCRIBE_SESSIONS_KEY);
const initialSessions: ScribeSession[] = savedSessions ? JSON.parse(savedSessions) : [];

export const scribeSessionsAtom = atom<ScribeSession[]>(initialSessions);

// Set up an atom with an effect to persist changes
export const persistentScribeSessionsAtom = atom(
  get => get(scribeSessionsAtom),
  (get, set, nextValue: ScribeSession[]) => {
    set(scribeSessionsAtom, nextValue);
    storage.set(SCRIBE_SESSIONS_KEY, JSON.stringify(nextValue));
  }
);
