import * as XLSX from 'xlsx';
import fs from 'fs';
import { ParsedRow } from './excelParser';
export type { ParsedRow } from './excelParser';

export function parseCSV(filePath: string): ParsedRow[] {
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer', raw: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return raw.map((row) => normalizeCSVRow(row));
}

export { parseCSV as parseCsv };

function normalizeCSVRow(row: Record<string, unknown>): ParsedRow {
  const normalized: ParsedRow = { errors: [] };
  for (const [key, value] of Object.entries(row)) {
    const lk = key.toLowerCase().trim();
    if (lk.includes('sku') || lk === 'productcode') normalized.sku = String(value || '').trim();
    else if (lk.includes('name') || lk.includes('品名') || lk.includes('product')) normalized.name = String(value || '').trim();
    else if (lk.includes('quantity') || lk.includes('qty') || lk.includes('数量')) normalized.quantity = Number(value) || 0;
    else if (lk.includes('price') || lk.includes('单价')) normalized.unitPrice = Number(value) || undefined;
    else if (lk.includes('note') || lk.includes('remark') || lk.includes('备注')) normalized.note = String(value || '').trim();
  }
  if (!normalized.sku) normalized.errors.push('Missing SKU');
  if (!normalized.quantity || normalized.quantity <= 0) normalized.errors.push('Invalid quantity (must be > 0)');
  return normalized;
}
