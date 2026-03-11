export type DocumentStatus = 'Processing' | 'Success' | 'Error' | 'Review Required' | 'Failed';
export type DocumentType = 'Invoice' | 'Contract' | 'Receipt' | 'Identity';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  date: string;
  confidence: number;
}

export interface ExtractionField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  icon: string;
  manualCheck?: boolean;
}
