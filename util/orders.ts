import { IngestionStatus } from '@/types/types';

export type OrderDisplayStatus = 'Ordered Placed' | 'Sample Accession' | 'Report Released';

export type OrderStepStatus = 'PLACED' | 'ACCESSION' | 'RELEASED';

export interface PatientOrder {
  testName: string;
  status: OrderDisplayStatus;
  sampleType?: string;
  orderPlacedTimestamp?: string | null;
  sampleAccessionTimestamp?: string | null;
  releasedDate?: string | null;
  fullReportPath?: string | number | null;
  documentId?: string | null;
  assayResultIds?: string;
  ingestionStatus?: string | null;
}

export interface PatientWithOrders {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  orders: PatientOrder[];
}

/**
 * Maps any raw status string to a consistent OrderDisplayStatus.
 * Used in allOrders list view.
 */
export function normalizeOrderDisplayStatus(rawStatus?: string): OrderDisplayStatus {
  const value = (rawStatus ?? '').toLowerCase();
  if (value.includes('release') || value.includes('report')) return 'Report Released';
  if (value.includes('accession')) return 'Sample Accession';
  return 'Ordered Placed';
}

/**
 * Maps an OrderDisplayStatus (or any raw string) to OrderStepStatus.
 * Used in the order detail card for the progress bar.
 */
export function toOrderStepStatus(status?: string): OrderStepStatus {
  const value = (status ?? '').toLowerCase();
  if (value.includes('release') || value.includes('report')) return 'RELEASED';
  if (value.includes('accession')) return 'ACCESSION';
  return 'PLACED';
}

/** Normalizes raw ingestion status strings into the typed IngestionStatus union. */
export function normalizeIngestionStatus(status?: string | null): IngestionStatus {
  if (status === 'ingested') return 'ingested';
  if (status === 'ingesting') return 'ingesting';
  if (status === 'failed') return 'failed';
  return '';
}

/** Formats an ISO timestamp to "DD Mon YY" or "--" if absent. */
export function formatTimestamp(value?: string | null): string {
  if (!value) return '--';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  } catch {
    return value;
  }
}

/**
 * Converts the raw assay-wise order-status API response into a normalised
 * list of PatientWithOrders.  Extracted here so both the list view and any
 * future consumer share a single mapping path.
 */
export function mapApiDataToPatients(apiData: any[]): PatientWithOrders[] {
  if (!Array.isArray(apiData)) return [];

  const map = new Map<string, PatientWithOrders>();

  apiData.forEach((item: any, index: number) => {
    const key = String(item.accessionId ?? item.accessionNumber ?? item.patientName ?? index);

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        patientName: item.patientName ?? 'Unknown',
        age: parseInt(item.age) || 0,
        gender: item.gender ?? '',
        orders: [],
      });
    }

    const assays: any[] = Array.isArray(item.assays) ? item.assays : [];

    if (assays.length > 0) {
      assays.forEach((assay: any) => {
        let status: OrderDisplayStatus;

        // Prefer explicit boolean flags; fall back to string-based normalisation.
        if (assay?.released === true) {
          status = 'Report Released';
        } else if (assay?.sampleAccessioned === true) {
          status = 'Sample Accession';
        } else if (assay?.orderPlaced === true) {
          status = 'Ordered Placed';
        } else {
          const rawStatus = Array.isArray(assay?.workflowStatuses)
            ? assay.workflowStatuses[0]
            : (assay?.status ?? assay?.workflowStatus ?? assay?.orderStatus ?? assay?.oncoindx_sub_pipeline);
          status = normalizeOrderDisplayStatus(rawStatus);
        }

        map.get(key)!.orders.push({
          testName: assay?.assayName ?? assay?.assay ?? assay?.testName ?? 'Unknown',
          status,
          sampleType:
            Array.isArray(assay?.sampleTypes) && assay.sampleTypes.length > 0
              ? assay.sampleTypes.join(' | ')
              : (assay?.sampleType ?? undefined),
          orderPlacedTimestamp: assay?.orderPlacedTimestamp ?? null,
          sampleAccessionTimestamp: assay?.sampleAccessionTimestamp ?? null,
          releasedDate: assay?.releasedDate ?? null,
          fullReportPath: assay?.fullReportPath ?? null,
          documentId: assay?.documentId ?? null,
          assayResultIds: Array.isArray(assay?.assayResultIds)
            ? assay.assayResultIds.join(',')
            : (assay?.assayResultIds?.toString?.() ?? ''),
          ingestionStatus: assay?.drg_ingestion_status ?? assay?.drgIngestionStatus ?? null,
        });
      });
    } else {
      // Flat item (no assays array) — treat item itself as a single order.
      map.get(key)!.orders.push({
        testName: item.assay ?? item.testName ?? 'Unknown',
        status: normalizeOrderDisplayStatus(item.status ?? item.workflowStatus),
      });
    }
  });

  return Array.from(map.values());
}
