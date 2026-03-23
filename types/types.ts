export type ESignatureData = {
  username: string;
  password: string;
};

export type IngestionStatus = 'ingesting' | 'ingested' | 'failed' | '' | null;
