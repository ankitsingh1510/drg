import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { apiFetch } from './fetchClient';

export interface AssayOrder {
  patientName: string;
  age: string | number;
  gender: string;
  accessionNumber: string;
  assay: string;
  status: string;
  sampleTs?: string;
  releasedTs?: string;
  [key: string]: any;
}

export interface GetAssayWiseOrderStatusParams {
  dateFrom?: string;
  dateTo?: string;
  accessionNumber?: string;
  patientName?: string;
  gender?: string;
  age?: string;
  assay?: string;
  sampleTsFrom?: string;
  sampleTsTo?: string;
  releasedFrom?: string;
  releasedTo?: string;
  count?: number;
  page?: number;
  restrictByRole?: boolean | string;
  studyId?: number[] | string;
  searchKey?: string;
}

export interface GetAssayWiseOrderStatusResponse {
  data: any[];
  totalCount: number;
  message?: string;
  statusCode?: number;
}

export interface StudyListItem {
  studyId: number;
  studyIdentifier: string;
  studyTitle: string;
  studyStatus: string;
}

class OrdersAPI {
  gqlUrl: string;

  constructor() {
    this.gqlUrl = process.env.EXPO_PUBLIC_GQL_URL as string;
  }

  async getGQLResponse(reqParams: GQLRequestParams): Promise<GQLResponse> {
    const response = await apiFetch(this.gqlUrl + '/graphql', {
      method: 'POST',
      body: JSON.stringify(reqParams),
    });
    return response.data as GQLResponse;
  }

  async getAssayWiseOrderStatus(params: GetAssayWiseOrderStatusParams = {}): Promise<GetAssayWiseOrderStatusResponse> {
    const {
      dateFrom = '',
      dateTo = '',
      accessionNumber = '',
      patientName = '', // As of now used only for filtering by patient name
      gender = '',
      age = '',
      assay = '',
      sampleTsFrom = '',
      sampleTsTo = '',
      releasedFrom = '',
      releasedTo = '',
      count = 10,
      page = 1,
      restrictByRole = 'true',
      studyId = [10],
      searchKey = '',
    } = params;

    const reqParams: GQLRequestParams = {
      query: `query GetAssayWiseOrderStatus($orderStatusModel: JSON!) {
        getAssayWiseOrderStatus(orderStatusModel: $orderStatusModel)
      }`,
      variables: {
        orderStatusModel: {
          dateFrom,
          dateTo,
          accessionNumber,
          patientName,
          gender,
          age,
          assay,
          sampleTsFrom,
          sampleTsTo,
          releasedFrom,
          releasedTo,
          count,
          page,
          restrictByRole,
          studyId,
          searchKey,
        },
      },
    };

    const gqlData = await this.getGQLResponse(reqParams);

    if (gqlData?.errors?.length) {
      console.error('[OrdersAPI] GraphQL errors:', JSON.stringify(gqlData.errors, null, 2));
      throw { status: 200, message: gqlData.errors[0]?.message ?? 'GraphQL error', data: gqlData };
    }

    const result = gqlData?.data?.getAssayWiseOrderStatus;

    if (Array.isArray(result)) {
      return {
        data: result,
        totalCount: result.length,
      };
    }

    if (Array.isArray(result?.data)) {
      return {
        data: result.data,
        totalCount: result?.totalCount ?? result.data.length,
        message: result?.message,
        statusCode: result?.statusCode,
      };
    }

    if (result?.error?.length) {
      throw {
        status: result?.statusCode ?? 500,
        message: result?.message ?? result?.error?.[0]?.message ?? 'Failed to fetch assay wise order status',
        data: result,
      };
    }

    return {
      data: [],
      totalCount: 0,
      message: result?.message,
      statusCode: result?.statusCode,
    };
  }

  async getStudyList(): Promise<number[]> {
    const reqParams: GQLRequestParams = {
      query: `query getStudyList {
        getStudyList
      }`,
    };

    const gqlData = await this.getGQLResponse(reqParams);

    if (gqlData?.errors?.length) {
      console.error('[OrdersAPI] getStudyList GraphQL errors:', JSON.stringify(gqlData.errors, null, 2));
      throw { status: 200, message: gqlData.errors[0]?.message ?? 'GraphQL error', data: gqlData };
    }

    const result = gqlData?.data?.getStudyList;
    const studies: StudyListItem[] = result?.data ?? [];
    return studies.map((s: StudyListItem) => s.studyId);
  }
}

export const ordersAPI = new OrdersAPI();
