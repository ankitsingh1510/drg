import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { apiFetch } from './fetchClient';

interface FetchTestsDetailsParams {
  page?: number;
  count?: number;
  searchQuery?: string;
  assayIds?: string;
}

export interface Patient {
  assayName: string;
  sampleBarcode: string;
  case_sample_id: number;
  workflowStatus: string;
  assayResultId: number;
  gender: string;
  age: string;
  accession_number: string;
  accession_id: number;
  documentId?: string;
  ingested_file_path?: string | null;
  drg_ingestion_status: string | null;
  physicianName: string;
  facility: string;
  diseaseName: string;
  additionalPhysician: string;
  oncoindx_sub_pipeline: string;
  full_report_path: string;
  full_report_html_paths: string[] | [];
  summary_report_path: string | null;
  patientName: string;
  analysisCompletionDate: string;
  assayResultIds: string;
  _totalCount: number;
}

export interface FetchTestsDetailsResponse {
  data: Patient[];
  totalCount: number;
}

class PatientsAPI {
  gqlUrl: string;

  constructor() {
    this.gqlUrl = process.env.EXPO_PUBLIC_GQL_URL as string;
  }

  async getGQLResponse(reqParams: GQLRequestParams): Promise<GQLResponse> {
    try {
      const response = await apiFetch(this.gqlUrl + '/graphql', {
        method: 'POST',
        body: JSON.stringify(reqParams),
      });

      return response.data as GQLResponse;
    } catch (error) {
      throw error;
    }
  }

  async fetchTestsDetails(params: FetchTestsDetailsParams): Promise<FetchTestsDetailsResponse> {
    const { page = 1, count = 10, searchQuery, assayIds } = params;

    const reqParams: GQLRequestParams = {
      query: `query fetchTestsDetailsForDrG($fetchTestsDetailsForDrGModel: JSON!) {
        fetchTestsDetailsForDrG(fetchTestsDetailsForDrGModel: $fetchTestsDetailsForDrGModel)
      }`,
      variables: {
        fetchTestsDetailsForDrGModel: {
          pagination: {
            sort: 'desc.analysisCompletionDate',
            page,
            count,
          },
          ...(assayIds ? { filters: `assay_id=${assayIds}` } : {}),
          search: searchQuery || '',
          restrictByRole: true,
          workflowName: 'ICARE_WORKFLOW',
        },
      },
    };

    try {
      const response = await this.getGQLResponse(reqParams);
      return response.data.fetchTestsDetailsForDrG;
    } catch (error) {
      console.error('Error fetching tests details:', error);
      throw error;
    }
  }
}

export const patientsAPI = new PatientsAPI();
