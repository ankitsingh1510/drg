import axios from 'axios';
import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { type userParams } from '../types/users';
import axiosInstance from './axios';

class UsersAPI {
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
      return response.data.data.getUserDetail;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return error;
    }
  }

  async authenticateUser(paramInfo: { username: string; password: string }): Promise<any> {
    try {
      const response = await axios.post(process.env.EXPO_PUBLIC_API_BASE_URL + `/api/token`, paramInfo);
      return response.data;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
}

export const usersAPI = new UsersAPI();
