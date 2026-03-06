export interface ScribeSession {
  id: string;
  patientName: string;
  phoneNumber: string;
  audioUri: string;
  duration?: number;
  timestamp: number;
}
