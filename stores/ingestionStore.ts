import { storage } from '@/stores/mmkv';

type IngestState = {
  status: 'INGESTING' | 'COMPLETED';
  documentId?: string;
  startedAt: number;
};

const key = (accessionId: string) => `ingest:${accessionId}`;

export const ingestionStore = {
  get(accessionId: string): IngestState | null {
    const raw = storage.getString(key(accessionId));
    return raw ? JSON.parse(raw) : null;
  },

  set(accessionId: string, value: IngestState) {
    storage.set(key(accessionId), JSON.stringify(value));
  },

  clear(accessionId: string) {
    storage.remove(key(accessionId));
  },
};
