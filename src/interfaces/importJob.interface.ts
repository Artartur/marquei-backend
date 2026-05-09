import { ImportStatus, ImportType } from 'generated/prisma/enums';

export interface ImportJob {
  id: string;
  managerId: string;
  fileName: string;
  importType: ImportType;
  status: ImportStatus;
  totalRows: number;
  processed: number;
  failed: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImportError {
  id: string;
  importJobId: string;
  row: number;
  reason: string;
  rawData: Record<string, unknown>;
}
