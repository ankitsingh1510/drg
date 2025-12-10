import { storage } from '@/stores/mmkv';
import { apiFetch } from './fetchClient';

class RagAPI {
  baseUrl: string;
  gqlUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL as string;
    this.gqlUrl = process.env.EXPO_PUBLIC_GQL_URL as string;
  }

  async getSignedUrl(blobPath: string): Promise<string> {
    try {
      const encodedPath = encodeURIComponent(blobPath);
      const url = `${this.baseUrl}/api/v1/storage/blobStoreObjects/${encodedPath}/signedUrl` + `?viewFile=true`;
      // Fetch GET call, removed axios Instance
      const response = await apiFetch(url, {
        method: 'GET',
      });
      return response.data?.signedUrl;
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      throw error;
    }
  }

  async ingestReport(accession_id: string) {
    try {
      console.log(accession_id);
      // const token = await AsyncStorage.getItem('token');
      const token = storage.getString('token') ?? null;
      const formData = new FormData();
      formData.append('isBlocking', 'true');
      formData.append('accession_id', accession_id);
      const response = await apiFetch(`${this.baseUrl}/api/v1/drg/rag`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error Ingesting file:', error);
      throw error;
    }
  }
}
export const ragAPI = new RagAPI();
