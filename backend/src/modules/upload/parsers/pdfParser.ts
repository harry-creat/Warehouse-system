import fs from 'fs';
import { ParsedRow } from './excelParser';

export async function parsePDF(filePath: string): Promise<ParsedRow[]> {
  const pdfParse = (await import('pdf-parse')).default;
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return extractRowsFromText(data.text);
}

function extractRowsFromText(text: string): ParsedRow[] {
  const lines = text.split('\n').filter((l) => l.trim());
  const rows: ParsedRow[] = [];
  const skuPattern = /[A-Z]{2,5}-\d{3,5}/g;

  for (const line of lines) {
    const skus = line.match(skuPattern);
    if (!skus) continue;

    const numbers = line.match(/\d+(\.\d+)?/g)?.map(Number) || [];

    for (const sku of skus) {
      const row: ParsedRow = {
        sku,
        quantity: numbers.length > 0 ? numbers[0] : 0,
        unitPrice: numbers.length > 1 ? numbers[1] : undefined,
        note: 'Extracted from PDF (best-effort)',
        errors: [],
      };
      if (!row.quantity || row.quantity <= 0) row.errors.push('Could not determine quantity');
      rows.push(row);
    }
  }

  return rows;
}
