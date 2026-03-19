import { atom, type WritableAtom } from 'jotai';
import { IngestionStatus } from '@/types/types';

export type ActiveReportDetails = {
  pdfUrl: string;
  patientName: string;
  documentId: string;
  assayResultIds: string;
  ingestionStatus?: IngestionStatus | null;
};

const activeReportStateAtom = atom<ActiveReportDetails | null>(null) as WritableAtom<
  ActiveReportDetails | null,
  [ActiveReportDetails | null],
  void
>;

export const activeReportAtom = atom(get => get(activeReportStateAtom));

export const setActiveReportAtom = atom(null, (_get, set, details: ActiveReportDetails | null) => {
  set(activeReportStateAtom, details);
});
