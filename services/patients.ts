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
  reportReleaseDate: string;
  assayResultIds: string;
  _totalCount: number;
}

export interface FetchTestsDetailsResponse {
  data: Patient[];
  totalCount: number;
}

export interface SubjectPatient {
  subjectId: number;
  studyId: number;
  suid: string;
  patient_name: string;
  gender: string;
  age: string;
  sample_analyte: string | null;
  facility: string;
  allPhysicianNames: string;
  assay: string;
  case_sample_id: number;
  disease_name: string;
  analysisCompletionDate: string;
  assay_result_id: number;
  _totalCount: number;
}

export interface FetchSubjectsDetailsResponse {
  data: SubjectPatient[];
}

interface FetchSubjectsDetailsParams {
  page?: number;
  count?: number;
  search?: string;
  studyIds?: string[];
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
            sort: 'desc.reportReleaseDate',
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

  async fetchSubjectsDetails(params: FetchSubjectsDetailsParams): Promise<FetchSubjectsDetailsResponse> {
    const { page = 1, count = 10, search = '', studyIds } = params;

    const reqParams: GQLRequestParams = {
      query: `query fetchSubjectsDetails($fetchSubjectsDetailsModel: JSON!) {
        fetchSubjectsDetails(fetchSubjectsDetailsModel: $fetchSubjectsDetailsModel)
      }`,
      variables: {
        fetchSubjectsDetailsModel: {
          studyFilter: studyIds || ['10'],
          pagination: {
            count,
            page,
            sort: 'desc.analysisCompletionDate',
          },
          filters: [
            {
              field: 'pipelineType',
              sourceTable: 'case_sample_attribute_value',
              type: 'multiselect',
              values: ['ONCOINDX', 'ONCOPREDIKT', 'ONCOCTC', 'QPCR_ALIBREX'],
            },
          ],
          getOnlyUserAssignedTests: false,
          getTotalCount: true,
          workflowName: 'ICARE_WORKFLOW',
          ...(search ? { search } : {}),
        },
      },
    };

    try {
      const response = await this.getGQLResponse(reqParams);
      return response.data.fetchSubjectsDetails;
    } catch (error) {
      console.error('Error fetching subjects details:', error);
      throw error;
    }
  }

  async getAssayResultAttributes(assayResultId: number): Promise<any> {
    if (!Number.isFinite(assayResultId)) {
      throw new Error('Invalid assayResultId provided.');
    }

    const reqParams: GQLRequestParams = {
      query: `query GetAssayResultAttributes {
        getAssayResultAttributes(assayResultId: ${assayResultId})
      }`,
    };

    try {
      const response = await this.getGQLResponse(reqParams);
      return response.data.getAssayResultAttributes?.data || null;
    } catch (error) {
      console.error('Error fetching assay result attributes:', error);
      throw error;
    }
  }
}

export const patientsAPI = new PatientsAPI();
