export function parseExcelDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number') {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + value * 86400000);
  }

  if (typeof value === 'string') {
    const parsed = new Date(value.trim());

    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date: ${value}`);
    }

    return parsed;
  }

  throw new Error('Invalid scheduledAt value');
}
