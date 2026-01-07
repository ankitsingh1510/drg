import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { type userParams } from '../types/users';
import { apiFetch } from './fetchClient';

class UsersAPI {
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

  async getUserDetail(paramInfo: userParams): Promise<any> {
    try {
      const reqParams: GQLRequestParams = {
        query: `query getUserDetail($userMasterModel: JSON!) {
                getUserDetail(userMasterModel: $userMasterModel)
              }`,
        variables: {
          userMasterModel: paramInfo,
        },
      };
      const response: GQLResponse = await this.getGQLResponse(reqParams);
      return response.data.getUserDetail;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return error;
    }
  }

  async authenticateUser(paramInfo: { username: string; password: string }): Promise<any> {
    try {
      const response = await apiFetch(process.env.EXPO_PUBLIC_API_BASE_URL + `/api/token`, {
        method: 'POST',
        body: JSON.stringify(paramInfo),
      });
      return response.data;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<any> {
    try {
      const reqParams: GQLRequestParams = {
        query: `query GetUserProfile {
                getUserProfile
            }`,
      };
      const response: GQLResponse = await this.getGQLResponse(reqParams);
      return response.data.getUserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(paramInfo: { userMasterModel: any; eSignatureModel: any }): Promise<any> {
    try {
      const reqParams: GQLRequestParams = {
        query: `mutation saveUserProfile($userMasterModel: UserProfileInput!, $eSignatureModel: JSON) {
                saveUserProfile(userMasterModel: $userMasterModel, eSignatureModel: $eSignatureModel)
            }`,
        variables: {
          userMasterModel: paramInfo.userMasterModel,
          eSignatureModel: paramInfo.eSignatureModel,
        },
      };
      const response: GQLResponse = await this.getGQLResponse(reqParams);
      return response.data.saveUserProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async sendMfaOtp(otpMedium: string): Promise<any> {
    try {
      const reqParams: GQLRequestParams = {
        query: `mutation sendMfaOtp($otpMedium: String!) {
                sendMfaOtp(otpMedium: $otpMedium)
            }`,
        variables: {
          otpMedium,
        },
      };
      const response: GQLResponse = await this.getGQLResponse(reqParams);
      return response.data.sendMfaOtp;
    } catch (error) {
      console.error('Error sending MFA OTP:', error);
      throw error;
    }
  }

  async verifyMfaOtp(otpMedium: string, otp: string): Promise<any> {
    try {
      const reqParams: GQLRequestParams = {
        query: `mutation verifyMfaOtp($otpMedium: String!, $otp: String!) {
                verifyMfaOtp(otpMedium: $otpMedium, otp: $otp)
            }`,
        variables: {
          otpMedium,
          otp,
        },
      };
      const response: GQLResponse = await this.getGQLResponse(reqParams);
      return response.data.verifyMfaOtp;
    } catch (error) {
      console.error('Error verifying MFA OTP:', error);
      throw error;
    }
  }
}

export const usersAPI = new UsersAPI();
