import * as Notifications from 'expo-notifications';
import { getFcmToken, storage } from '@/stores/mmkv';
import { API_BASE_URL, GQL_BASE_URL } from './env';
import { apiFetch } from './fetchClient';

class RagAPI {
  baseUrl: string;
  gqlUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.gqlUrl = GQL_BASE_URL;
  }

  async ingestReport(assayResultIds: string) {
    try {
      const token = storage.getString('token') ?? null;
      const isFirebaseEnabled = process.env.EXPO_PUBLIC_ENABLE_FIREBASE === 'true' || false;
      const fcmToken = isFirebaseEnabled ? (getFcmToken() ?? null) : null;
      const formData = new FormData();
      const { status } = await Notifications.getPermissionsAsync();
      formData.append('assay_ids', assayResultIds);
      if (fcmToken && isFirebaseEnabled && status === 'granted') {
        formData.append('fcmKey', fcmToken);
      }
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

  async fetchReportResult(params: { documentId: string; authorization: string }) {
    try {
      const { documentId, authorization } = params;
      const url = new URL(`${this.baseUrl}/api/v1/drg/rag`);
      url.searchParams.append('question', encodeURIComponent('Fetch report raw vectors'));
      url.searchParams.append('documentId', documentId);
      url.searchParams.append('rawVector', 'true');
      url.searchParams.append('topK', '100');
      url.searchParams.append('validateQuestion', 'false');
      url.searchParams.append('scope', 'general');

      const response = await apiFetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authorization}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Fetch Results Error:', error);
      throw error;
    }
  }
}
export const ragAPI = new RagAPI();
