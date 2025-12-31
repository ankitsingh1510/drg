import { type GQLRequestParams, type GQLResponse } from '../types/api';
import { apiFetch } from './fetchClient';

interface FetchTestsDetailsParams {
  studyFilter: number[];
  page?: number;
  count?: number;
  searchQuery?: string;
  workflowStatusFilter?: string;
}

export interface Patient {
  assayName: string;
  documentId?: string;
  ingested_file_path?: string | null;
  sampleBarcode: string;
  full_report_path: string;
  summary_report_path: string | null;
  released_full_report_path: string | null;
  released_summary_report_path: string | null;
  workflowStatus: string;
  full_report_finalized_path: string;
  summary_report_finalized_path: string | null;
  gender: string;
  age: string;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  accession_number: string;
  accession_id: number;
  physicianName: string;
  facility: string;
  diseaseName: string;
  additionalPhysician: string;
  patientName: string;
  reportFinalizedDate: string;
  full_report_html_path: string;
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
    const { studyFilter, page = 1, count = 10, searchQuery, workflowStatusFilter } = params;

    const filters: Array<
      | { field: string; sourceTable?: string; type: string; values?: string[] }
      | { OR: Array<{ field: string; sourceTable?: string; type: string; values?: string[] }> }
    > = [
      {
        field: 'full_report_path',
        type: 'not-empty',
      },
      {
        field: 'oncoindx_sub_pipeline',
        type: 'case_insensitive_not',
        sourceTable: 'case_sample_attribute_value',
        values: ['edta'],
      },
    ];

    if (workflowStatusFilter && workflowStatusFilter !== 'All') {
      filters.push({
        field: 'workflow_status',
        sourceTable: 'assay_attribute_value',
        type: 'fuzzy',
        values: [workflowStatusFilter],
      });
    }

    if (searchQuery && searchQuery.trim()) {
      filters.push({
        field: 'patientName',
        type: 'fuzzy',
        values: [searchQuery.trim()],
      });
    }

    const reqParams: GQLRequestParams = {
      query: `query fetchTestsDetails($fetchTestsDetailsModel: JSON!) {
        fetchTestsDetails(fetchTestsDetailsModel: $fetchTestsDetailsModel)
      }`,
      variables: {
        fetchTestsDetailsModel: {
          fields: {
            case_sample: [
              {
                field: 'sample_barcode',
                alias: 'sampleBarcode',
              },
              {
                field: 'case_sample_id',
                alias: 'case_sample_id',
              },
            ],
            case_assay_sample: [
              {
                field: 'assay',
                alias: 'assayName',
              },
            ],
            assay_attribute_value: [
              {
                field: 'workflow_status',
                alias: 'workflowStatus',
              },
              {
                field: 'full_report_finalized_path',
              },
              {
                field: 'summary_report_finalized_path',
              },
              {
                field: 'released_full_report_path',
              },
              {
                field: 'released_summary_report_path',
              },
            ],
            subject_attribute_value: [
              {
                field: 'gender',
              },
              {
                field: 'age',
              },
              {
                field: 'first_name',
              },
              {
                field: 'middle_name',
              },
              {
                field: 'last_name',
              },
            ],
            accession: [
              {
                field: 'accession_number',
              },
              {
                field: 'accession_id',
              },
            ],
            accession_attribute_value: [
              {
                field: 'documentId',
              },
              {
                field: 'ingested_file_path',
              },
              {
                field: 'physician_name',
                alias: 'physicianName',
              },
              {
                field: 'facility',
              },
              {
                field: 'cancer_type',
                alias: 'diseaseName',
              },
              {
                field: 'physician_name_1',
                alias: 'additionalPhysician',
              },
            ],
            case_sample_attribute_value: [
              {
                field: 'oncoindx_sub_pipeline',
              },
            ],
          },
          aggregations: [
            {
              alias: 'full_report_path',
              expression: 'COALESCE([0], [1])',
              sourceColumns: [
                {
                  field: 'released_full_report_path',
                  sourceTable: 'assay_attribute_value',
                },
                {
                  field: 'full_report_finalized_path',
                  sourceTable: 'assay_attribute_value',
                },
              ],
            },
            {
              alias: 'summary_report_path',
              expression: 'COALESCE([0], [1])',
              sourceColumns: [
                {
                  field: 'released_summary_report_path',
                  sourceTable: 'assay_attribute_value',
                },
                {
                  field: 'summary_report_finalized_path',
                  sourceTable: 'assay_attribute_value',
                },
              ],
            },
            {
              alias: 'patientName',
              expression: "CONCAT_WS(' ', NULLIF(TRIM([0]), ''), NULLIF(TRIM([1]), ''), NULLIF(TRIM([2]), ''))",
              sourceColumns: [
                {
                  field: 'first_name',
                  sourceTable: 'subject_attribute_value',
                },
                {
                  field: 'middle_name',
                  sourceTable: 'subject_attribute_value',
                },
                {
                  field: 'last_name',
                  sourceTable: 'subject_attribute_value',
                },
              ],
            },
            {
              alias: 'analysisCompletionDate',
              expression:
                "coalesce(( select csav.date_modified from case_sample_attribute_value csav where csav.case_sample_id = [0] and csav.attribute_name = 'pipelineStatus' and csav.is_deleted = 0 ),( select csav.date_created  from case_sample_attribute_value csav where csav.case_sample_id = [0] and csav.attribute_name = 'pipelineStatus' and csav.is_deleted = 0 ))",
              sourceColumns: [
                {
                  field: 'case_sample_id',
                  sourceTable: 'case_sample',
                },
              ],
            },
          ],
          pagination: {
            sort: 'desc.analysisCompletionDate',
            page,
            count,
          },
          filters,
          includeSubject: true,
          includeAccession: true,
          includeCaseSample: true,
          includeAssayResult: true,
          restrictByRole: true,
          getTotalCount: true,
          workflowName: 'ICARE_WORKFLOW',
          distinctAccessions: true,
          studyFilter,
        },
      },
    };

    try {
      const response = await this.getGQLResponse(reqParams);
      return response.data.fetchTestsDetails;
    } catch (error) {
      console.error('Error fetching tests details:', error);
      throw error;
    }
  }
}

export const patientsAPI = new PatientsAPI();
