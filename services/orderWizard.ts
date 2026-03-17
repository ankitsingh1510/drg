import RNBlobUtil from 'react-native-blob-util';
import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { apiFetch } from './fetchClient';

// TODO: move these back to env vars before merging
const LOCAL_GQL_URL = 'http://192.192.16.187:3301/graphql';

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
  statusCode: number | null;
  message: string | null;
  error: string[] | null;
}

class OrderWizardAPI {
  gqlUrl: string = (process.env.EXPO_PUBLIC_GQL_URL as string) + '/graphql';

  async getGQLResponse(reqParams: GQLRequestParams): Promise<GQLResponse> {
    try {
      const response = await apiFetch(this.gqlUrl, {
        method: 'POST',
        body: JSON.stringify(reqParams),
      });

      const gqlData = response.data as GQLResponse;

      // Surface GraphQL-level errors (returned as 200 OK but with errors in body)
      if (gqlData?.errors?.length) {
        console.error('[OrderWizardAPI] GraphQL errors:', JSON.stringify(gqlData.errors, null, 2));
        throw { status: 200, message: gqlData.errors[0]?.message ?? 'GraphQL error', data: gqlData };
      }

      return gqlData;
    } catch (error: any) {
      // Re-log HTTP-level errors (4xx/5xx) with the full errors array readable
      if (error?.data?.errors) {
        console.error('[OrderWizardAPI] HTTP error with GQL errors:', JSON.stringify(error.data.errors, null, 2));
      }
      throw error;
    }
  }

  async getRecommendation(answers: Record<string, string | string[]>): Promise<RecommendationResponse> {
    const reqParams: GQLRequestParams = {
      query: `mutation orderWizardRecommend($answers: JSON) {
        orderWizardRecommend(answers: $answers) {
          suggestedTests {
            testName
            testVariant
            confidence
            reasoning
          }
          statusCode
          message
          error
        }
      }`,
      variables: { answers },
    };

    const response = await this.getGQLResponse(reqParams);
    return response.data.orderWizardRecommend;
  }

  async extractFromDocument(uri: string, fileName: string, mimeType: string): Promise<ExtractedData> {
    // Read file as base64 and send via GraphQL (server uses body-parser, no multipart)
    const cleanUri = uri.replace('file://', '');
    const base64 = await RNBlobUtil.fs.readFile(cleanUri, 'base64');

    const reqParams: GQLRequestParams = {
      query: `mutation orderWizardExtractDocument($base64: String, $fileName: String, $mimeType: String) {
        orderWizardExtractDocument(base64: $base64, fileName: $fileName, mimeType: $mimeType)
      }`,
      variables: { base64, fileName, mimeType },
    };

    const response = await this.getGQLResponse(reqParams);
    return response.data.orderWizardExtractDocument;
  }

  async extractFromDocumentBase64(base64: string, fileName: string, mimeType: string): Promise<ExtractedData> {
    const reqParams: GQLRequestParams = {
      query: `mutation orderWizardExtractDocument($base64: String, $fileName: String, $mimeType: String) {
        orderWizardExtractDocument(base64: $base64, fileName: $fileName, mimeType: $mimeType)
      }`,
      variables: { base64, fileName, mimeType },
    };

    const response = await this.getGQLResponse(reqParams);
    return response.data.orderWizardExtractDocument;
  }

  /**
   * Extract document answers via GraphQL using the already-uploaded S3 key.
   * drg → icore_bl (GraphQL) → icore_rag
   * icore_bl fetches the file from S3 and forwards it to icore-rag as multipart.
   */
  async extractFromDocumentByS3Key(s3Key: string, fileName: string, mimeType: string): Promise<ExtractedData> {
    const reqParams: GQLRequestParams = {
      query: `mutation orderWizardExtractDocument($path: String, $fileName: String, $mimeType: String) {
        orderWizardExtractDocument(path: $path, fileName: $fileName, mimeType: $mimeType)
      }`,
      variables: { path: s3Key, fileName, mimeType },
    };

    const response = await this.getGQLResponse(reqParams);
    return response.data.orderWizardExtractDocument;
  }
}

const orderWizardAPI = new OrderWizardAPI();

export const getRecommendation = (answers: Record<string, string | string[]>) =>
  orderWizardAPI.getRecommendation(answers);

export const extractFromDocument = (uri: string, fileName: string, mimeType: string) =>
  orderWizardAPI.extractFromDocument(uri, fileName, mimeType);

export const extractFromDocumentBase64 = (base64: string, fileName: string, mimeType: string) =>
  orderWizardAPI.extractFromDocumentBase64(base64, fileName, mimeType);

export const extractFromDocumentByS3Key = (s3Key: string, fileName: string, mimeType: string) =>
  orderWizardAPI.extractFromDocumentByS3Key(s3Key, fileName, mimeType);
