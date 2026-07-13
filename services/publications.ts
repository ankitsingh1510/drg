export interface Publication {
  title: string;
  content: string;
  image: string;
  url: string;
  reading_time: string;
  event: string;
  date: string;
  content_type: string;
  test_type: string[];
  cancer_type: string[];
  use_case: string[];
  biomarker: string[];
}

export interface PublicationsResponse {
  success: boolean;
  posts: Publication[];
  total: number;
}

export interface PublicationFilters {
  content_type?: string[];
  cancer_type?: string[];
  test_type?: string[];
  use_case?: string[];
  biomarker?: string[];
}

/**
 * Fetches publications from the 1cell.ai WordPress API.
 * This API is public (no auth token needed), so we use plain fetch
 * instead of apiFetch which adds Bearer tokens.
 */
export async function fetchPublications(
  page: number = 1,
  filters: PublicationFilters = {}
): Promise<PublicationsResponse> {
  const params = new URLSearchParams();
  params.append('page', String(page));

  if (filters.content_type?.length) params.append('content_type', filters.content_type.join(','));
  if (filters.cancer_type?.length) params.append('cancer_type', filters.cancer_type.join(','));
  if (filters.test_type?.length) params.append('test_type', filters.test_type.join(','));
  if (filters.use_case?.length) params.append('use_case', filters.use_case.join(','));
  if (filters.biomarker?.length) params.append('biomarker', filters.biomarker.join(','));

  const url = `${process.env.EXPO_PUBLIC_PUBLICATIONS_API_URL}?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch publications: ${response.status}`);
  }

  const data: PublicationsResponse = await response.json();

  if (!data.success) {
    throw new Error('Publications API returned unsuccessful response');
  }

  return data;
}

export const FILTER_OPTIONS = {
  content_type: ['Abstract', 'Journal', 'Poster'],
  cancer_type: [
    'Breast Cancer',
    'Colorectal Cancer',
    'Endometrial Cancer',
    'Gall Bladder Cancer',
    'Gastrointestinal Cancer',
    'Head & Neck Cancer',
    'Hepatobiliary Cancer',
    'Liver Cancer',
    'Lung Cancer',
    'Melanoma Cancer',
    'Non specific Cancer',
    'Oral Cancer',
    'Ovary Cancer',
    'Pancreas Cancer',
    'Prostate Cancer',
    'Renal Cancer',
    'Stomach Cancer',
    'Urothelial Cancer',
  ],
  test_type: [
    'OncoCTC',
    'AI',
    'OncoIndx',
    'OncoRadar',
    'OncoRisk',
    'OncoPredikt',
    'ResNet AI',
    'OncoAlibrex',
    'OncoDialysis',
    'OncoMonitor',
  ],
  use_case: [
    'Treatment Selection',
    'Longitudinal Monitoring',
    'MRD',
    'Early detection/ Risk Stratification',
    'Pharmacogenomics',
    'Therapeutic Application',
  ],
  biomarker: [
    'CTC',
    'ctDNA',
    'PTEN',
    'PIK3CA',
    'TP53',
    'PDL1',
    'EGFR',
    'HRD',
    'BRCA1/2',
    'HRR',
    'MSI',
    'MMR',
    'MSH2',
    'Lynch Syndrome',
    'PGx',
    'KRAS',
    'DPYD',
    'TYMS',
    'UGT1A1',
    'TMB',
    'cfDNA',
    'BRAF',
    'APC',
    'DNA',
    'NF1',
    'STK11',
    'NOTCH1/2',
    'PARP',
    'ATM',
    'ARID1A/B',
    'IDH1',
    'CCND1/2',
    'ERBB2',
    'PALB2',
    'ESR1',
    'HER2',
    'FGFR',
    'ALK',
    'MET',
  ],
} as const;

export type FilterKey = keyof typeof FILTER_OPTIONS;
