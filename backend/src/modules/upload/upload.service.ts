import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { parseExcel, ParsedRow } from './parsers/excelParser';
import { parseCSV } from './parsers/csvParser';
import { parsePDF } from './parsers/pdfParser';
import transactionsService from '../transactions/transactions.service';

const prisma = new PrismaClient();

export class UploadService {
  async processUploadFile(
    filePath: string,
    fileType: string,
    originalName: string,
    fileSize: number,
    operatorId: string,
    transactionType: string,
    operatorName?: string,
  ) {
    let rows: ParsedRow[] = [];
    const ext = path.extname(originalName).toLowerCase();
    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    try {
      if (ext === '.xlsx' || ext === '.xls') {
        rows = parseExcel(filePath);
      } else if (ext === '.csv') {
        rows = parseCSV(filePath);
      } else if (ext === '.pdf') {
        rows = await parsePDF(filePath);
      } else {
        throw new Error(`Unsupported file extension: ${ext}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Parse error';
      await prisma.uploadRecord.create({
        data: {
          filename: path.basename(filePath),
          originalName,
          fileType,
          fileSize,
          status: 'FAILED',
          parsedRows: 0,
          successRows: 0,
          failedRows: 0,
          errorLog: message,
          uploadedBy: operatorId,
        },
      });
      throw err;
    }

    const validRows = rows.filter((r) => r.errors.length === 0 && r.sku);
    const invalidRows = rows.filter((r) => r.errors.length > 0 || !r.sku);
    let successCount = 0;
    let failCount = invalidRows.length;
    const errorDetails: string[] = [];

    for (const row of invalidRows) {
      errorDetails.push(`SKU: ${row.sku || 'N/A'} — ${row.errors.join(', ')}`);
    }

    for (const row of validRows) {
      try {
        const product = await this.findOrCreateProduct(row.sku!, row.name, row.unitPrice);
        await transactionsService.createTransaction(
          transactionType,
          product.id,
          row.quantity || 0,
          row.unitPrice,
          operatorId,
          row.note,
          originalName,
          batchId,
          operatorName,
        );
        successCount++;
      } catch (err: unknown) {
        failCount++;
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errorDetails.push(`SKU: ${row.sku} — ${msg}`);
      }
    }

    await prisma.uploadRecord.create({
      data: {
        filename: path.basename(filePath),
        originalName,
        fileType,
        fileSize,
        status: failCount === 0 ? 'PROCESSED' : 'PARTIAL',
        parsedRows: rows.length,
        successRows: successCount,
        failedRows: failCount,
        errorLog: errorDetails.length > 0 ? JSON.stringify(errorDetails) : null,
        uploadedBy: operatorId,
      },
    });

    try { fs.unlinkSync(filePath); } catch { /* ignore cleanup errors */ }

    return {
      batchId,
      total: rows.length,
      success: successCount,
      failed: failCount,
      errors: errorDetails.slice(0, 20),
    };
  }

  private async findOrCreateProduct(sku: string, name?: string, unitPrice?: number) {
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) return existing;

    return prisma.product.create({
      data: {
        sku,
        name: name || sku,
        category: 'Imported',
        unit: 'pcs',
        unitPrice: unitPrice ?? 0,
      },
    });
  }

  async getUploadHistory(page: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.uploadRecord.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.uploadRecord.count(),
    ]);
    return { data, total };
  }

  async generateTemplate(): Promise<Buffer> {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const headers = ['SKU', '品名/Name', '数量/Quantity', '单价/UnitPrice', '备注/Note'];
    const sampleData = [
      ['PRD-001', '螺丝钉', 500, 0.50, '采购入库'],
      ['PRD-002', '轴承', 20, 35.00, '补货入库'],
      ['PRD-003', '润滑油', 100, 15.00, ''],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    return buffer;
  }
}

export default new UploadService();
