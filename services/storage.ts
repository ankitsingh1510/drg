import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { type ESignatureData } from '../types/types';
import { API_BASE_URL, GQL_BASE_URL } from './env';
import { apiFetch } from './fetchClient';

class StorageAPI {
  baseUrl: string;
  gqlUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.gqlUrl = GQL_BASE_URL;
  }

  getGQLResponse(reqParams: GQLRequestParams): Promise<GQLResponse> {
    return new Promise((resolve, reject) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      // When requesting signed upload URLs from the backend, include X-Platform-Handheld
      // as required by the backend for uploads originating from handheld platforms.
      try {
        if (reqParams && typeof reqParams.query === 'string' && reqParams.query.includes('createUploadSignedUrls')) {
          headers['X-Platform-Handheld'] = 'true';
        }
      } catch (e) {
        // ignore and proceed without the header if any unexpected input
      }

      apiFetch(this.gqlUrl + '/graphql', {
        method: 'POST',
        headers,
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

  async getSignedUrl(storageParam: string | number): Promise<string> {
    try {
      const isStorageId =
        typeof storageParam === 'number' || (typeof storageParam === 'string' && !isNaN(Number(storageParam)));
      const reqParams: GQLRequestParams = isStorageId
        ? {
            query: `query GetSignedURL($storageId: Int!, $viewFile: Boolean!) {
              getSignedURL(storageId: $storageId, viewFile: $viewFile)
            }`,
            variables: { storageId: Number(storageParam), viewFile: true },
          }
        : {
            query: `query GetSignedURL($storagePath: String!) {
              getSignedURL(storagePath: $storagePath)
            }`,
            variables: { storagePath: storageParam },
          };

      const response = await this.getGQLResponse(reqParams);
      const signedUrl = response?.data?.getSignedURL?.data;

      if (!signedUrl) {
        throw new Error('Signed URL not found in GraphQL response');
      }

      return signedUrl;
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      throw error;
    }
  }

  async createUploadSignedUrls(signedUrlUploadInput: {
    target?: string;
    files: Array<{
      filename: string;
      contentType?: string;
      targetLocation?: string;
      fileSize?: number;
      crc32cHash: string;
    }>;
    anonymized?: string;
    referenceId?: string;
    referenceType?: string;
    fileDataType?: string;
    checkOrgUserMapping?: boolean;
  }): Promise<any> {
    const reqParams: GQLRequestParams = {
      query: `mutation createUploadSignedUrls($signedUrlUploadInput: SignedUrlUploadInput!) {
  createUploadSignedUrls(signedUrlUploadInput: $signedUrlUploadInput) {
    message
    statusCode
    error
    data {
      key
      uploadSignedUrl
      expiresIn
    }
  }
}
`,
      variables: { signedUrlUploadInput },
    };
    const response = await this.getGQLResponse(reqParams);
    return response.data.createUploadSignedUrls;
  }

  async registerSignedURLUpload(signedURLUploadRegistrationParams: {
    paths: Array<{ path: string; anonymized?: string }>;
    isPostSignedUrlUploadCall: boolean;
  }): Promise<any> {
    const reqParams: GQLRequestParams = {
      query: `mutation registerSignedURLUpload($signedURLUploadRegistrationParams: SignedURLUploadRegistrationParams!) {
  registerSignedURLUpload(signedURLUploadRegistrationParams: $signedURLUploadRegistrationParams)
}
`,
      variables: { signedURLUploadRegistrationParams },
    };
    const response = await this.getGQLResponse(reqParams);
    return response.data.registerSignedURLUpload;
  }
}

export const storageAPI = new StorageAPI();
