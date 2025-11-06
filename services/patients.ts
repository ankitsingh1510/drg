import { type GQLRequestParams, type GQLResponse } from '../types/api';
import axiosInstance from './axios';

interface FetchTestsDetailsParams {
  studyFilter: number[];
  page?: number;
  count?: number;
  searchQuery?: string;
  workflowStatusFilter?: string;
}

export interface Patient {
  assayName: string;
  suid: string;
  sampleBarcode: string;
  report_finalized_date: string;
  finalized_report_status: string;
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

  async fetchTestsDetails(params: FetchTestsDetailsParams): Promise<FetchTestsDetailsResponse> {
    const { studyFilter, page = 1, count = 10, searchQuery, workflowStatusFilter } = params;

    const filters = [
      {
        field: 'finalized_report_status',
        sourceTable: 'assay_attribute_value',
        type: 'exact',
        values: ['true'],
      },
      {
        field: 'full_report_finalized_path',
        sourceTable: 'assay_attribute_value',
        type: 'not-empty',
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
        sourceTable: '',
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
            subject: [
              {
                field: 'suid',
              },
            ],
            case_sample: [
              {
                field: 'sample_barcode',
                alias: 'sampleBarcode',
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
                field: 'report_finalized_date',
              },
              {
                field: 'finalized_report_status',
              },
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
          },
          aggregations: [
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
              alias: 'reportFinalizedDate',
              expression:
                "CASE WHEN [0] IS NULL OR [0] = '' THEN NULL ELSE TO_CHAR(TO_DATE([0], 'YYYY-MM-DD\"T\"HH24:MI'), 'DD Mon YYYY') END",
              sourceColumns: [
                {
                  field: 'report_finalized_date',
                  sourceTable: 'assay_attribute_value',
                },
              ],
            },
            {
              alias: 'full_report_html_path',
              expression: "REGEXP_REPLACE([0], '/[^/]+$', '/body.html')",
              sourceColumns: [
                {
                  field: 'full_report_finalized_path',
                  sourceTable: 'assay_attribute_value',
                },
              ],
            },
          ],
          pagination: {
            sort: 'desc.report_finalized_date',
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
      return response.data.data.fetchTestsDetails;
    } catch (error) {
      console.error('Error fetching tests details:', error);
      throw error;
    }
  }
}

export const patientsAPI = new PatientsAPI();
