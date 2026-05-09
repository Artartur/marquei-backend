import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';

const CSV_MIMETYPES = ['text/csv', 'application/csv', 'text/plain'];

export function parseFile(
  buffer: Buffer,
  mimetype: string,
): Record<string, string>[] {
  if (CSV_MIMETYPES.includes(mimetype)) {
    return parse(buffer, {
      columns: true,
      trim: true,
      skip_empty_lines: true,
    });
  }

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}
