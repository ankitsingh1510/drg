import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { type ESignatureData } from '../types/types';
import axiosInstance from './axios';

class StorageAPI {
  baseUrl: string;
  gqlUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL as string;
    this.gqlUrl = process.env.EXPO_PUBLIC_GQL_URL as string;
  }

  getGQLResponse(reqParams: GQLRequestParams): Promise<GQLResponse> {
    return new Promise((resolve, reject) => {
      axiosInstance
        .post(this.gqlUrl + '/graphql', reqParams, {})
        .then(response => resolve(response))
        .catch(error => {
          reject(error);
        });
    });
  }

  async getUploadConfig(): Promise<any> {
    const reqParams: GQLRequestParams = {
      query: `query getUploadConfig { getUploadConfig }`,
    };

    const response = await this.getGQLResponse(reqParams);
    return response.data.data.getUploadConfig;
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

      const response = await axiosInstance.post(`${this.baseUrl}/api/v1/storage/blobStoreObjects`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.fileInfo && response.data.fileInfo.length > 0) {
        const paramData = response.data.fileInfo.pop();
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

  async getSignedUrl(blobPath: string, fileType: string): Promise<string> {
    try {
      const encodedPath = encodeURIComponent(blobPath);
      const response = await axiosInstance.get(
        `${this.baseUrl}/api/v1/storage/blobStoreObjects/${encodedPath}/signedUrl`,
        {
          params: {
            viewFile: 'true',
            fileType: encodeURIComponent(fileType),
          },
        }
      );
      console.log('Signed URL response:', response);
      return response.data?.signedUrl;
    } catch (error) {
      console.error('Error fetching signed URL:', error);
      throw error;
    }
  }
}

export const storageAPI = new StorageAPI();
