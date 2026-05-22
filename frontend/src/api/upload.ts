import client from './client';
import type { PaginatedResponse, UploadRecord, UploadResult } from '../types';

export async function uploadStockIn(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await client.post<{ success: boolean; data: UploadResult }>('/upload/stock-in', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function uploadStockOut(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await client.post<{ success: boolean; data: UploadResult }>('/upload/stock-out', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function getUploadHistory(params?: { page?: number; limit?: number }) {
  const res = await client.get<PaginatedResponse<UploadRecord>>('/upload/history', { params });
  return res.data;
}

export async function downloadTemplate() {
  const res = await client.get('/upload/template', { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wms-template.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
