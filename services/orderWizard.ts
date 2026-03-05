import { apiFetch } from './fetchClient';

export interface RecommendAnswers {
  answers: Record<string, string | string[]>;
}

export interface ExtractedData {
  [key: string]: string | string[];
}

export interface RecommendationResponse {
  suggestedTests: Array<{
    testName: string;
    testVariant: string | null;
    confidence: number;
    reasoning: string;
  }>;
}

export async function getRecommendation(answers: Record<string, string | string[]>): Promise<RecommendationResponse> {
  const response = await apiFetch(`http://192.192.16.187:3020/api/v1/drg/order-wizard/recommend`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });

  return response.data.data;
}

export async function extractFromDocument(uri: string, fileName: string, mimeType: string): Promise<ExtractedData> {
  const formData = new FormData();
  formData.append('document', {
    uri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await apiFetch(`http://192.192.16.187:3020/api/v1/drg/order-wizard/extract-document`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}
