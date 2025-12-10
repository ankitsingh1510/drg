import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { apiFetch } from './fetchClient';

class StudyAPI {
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

  async getStudyList2(studyId: number) {
    try {
      let reqParams = {
        query: `query getStudyList2($studyId:Int,$includeMeta: Boolean, $paginationParams: JSON) {getStudyList(studyId : $studyId, includeMeta: $includeMeta, paginationParams: $paginationParams)}`,
        variables: {
          studyId: studyId,
          includeMeta: false,
          paginationParams: {
            studyId,
            fields: ['studyId', 'studyIdentifier', 'shortName', 'longName', 'description', 'studyTitle', 'studyStatus'],
          },
        },
      };
      let response = await this.getGQLResponse(reqParams);
      return response.data.data.getStudyList.data;
    } catch (error) {
      console.error('Error fetching study list:', error);
      throw error;
    }
  }

  async getStudyList() {
    let reqParams = {
      query: `query getStudies($paginationParams: JSON, $includeMeta: Boolean, $includeDeleted: Boolean,  $studyStatus: String ) {getStudyList(paginationParams:$paginationParams, includeMeta: $includeMeta, includeDeleted: $includeDeleted, studyStatus: $studyStatus)}`,
      variables: {
        paginationParams: {
          paginationParams: {
            sort: 'desc.studyId',
            includeMeta: false,
          },
          includeMeta: false,
          includeDeleted: false,
          studyStatus: 'Ongoing',
        },
        includeMeta: false,
        includeDeleted: false,
        studyStatus: null,
      },
    };
    let response = await this.getGQLResponse(reqParams);
    return response.data.data.getStudyList;
  }
}

export const studyAPI = new StudyAPI();
