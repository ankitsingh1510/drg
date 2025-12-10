import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { type ESignatureData } from '../types/types';
import { apiFetch } from './fetchClient';

class StorageAPI {
  baseUrl: string;
  gqlUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL as string;
    this.gqlUrl = process.env.EXPO_PUBLIC_GQL_URL as string;
  }

  getGQLResponse(reqParams: GQLRequestParams): Promise<GQLResponse> {
    return new Promise((resolve, reject) => {
      apiFetch(this.gqlUrl + '/graphql', {
        method: 'POST',
        body: JSON.stringify(reqParams),
      })
        .then(response => resolve(response.data as GQLResponse))
        .catch(error => reject(error));
    });
  }

  async getUploadConfig(): Promise<any> {
    const reqParams: GQLRequestParams = {
      query: `query getUploadConfig { getUploadConfig }`,
    };

    const response = await this.getGQLResponse(reqParams);
    return response.data.getUploadConfig;
  }

  async uploadFile(file: File, targetLocation: string, esigature: ESignatureData): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('username', esigature.username);
      formData.append('password', esigature.password);
      formData.append('changeReasonDetail', 'File upload');
      formData.append('files', file);
      formData.append('targetLocation', targetLocation);
      formData.append('size', file.size.toString());
      formData.append('anonymized', 'no');

      // Do NOT set Content-Type manually for FormData in fetch
      const response = await apiFetch(`${this.baseUrl}/api/v1/storage/blobStoreObjects`, {
        method: 'POST',
        body: formData,
      });

      const data = response.data;

      if (data && data.fileInfo && data.fileInfo.length > 0) {
        const paramData = data.fileInfo.pop();
        const storageId = paramData.storageId;
        return storageId;
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getSignedUrl(blobPath: string): Promise<string> {
    try {
      const encodedPath = encodeURIComponent(blobPath);
      const url = `${this.baseUrl}/api/v1/storage/blobStoreObjects/${encodedPath}/signedUrl` + `?viewFile=true`;
      const response = await apiFetch(url, { method: 'GET' });
      return response.data?.signedUrl;
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      throw error;
    }
  }
}

export const storageAPI = new StorageAPI();
