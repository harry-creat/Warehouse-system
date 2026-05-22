export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidSKU(sku: string): boolean {
  return /^[A-Z0-9_-]{2,50}$/i.test(sku);
}

export function isPositiveNumber(value: number): boolean {
  return value > 0 && Number.isFinite(value);
}

export function validateFileType(file: File): boolean {
  const allowed = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/pdf',
  ];
  return allowed.includes(file.type);
}

export function validateFileSize(file: File, maxMB = 10): boolean {
  return file.size <= maxMB * 1024 * 1024;
}
