import client from './client';
import type { PaginatedResponse, Transaction } from '../types';

export async function getTransactions(params?: {
  page?: number; limit?: number; type?: string; productId?: string;
  startDate?: string; endDate?: string;
}) {
  const res = await client.get<PaginatedResponse<Transaction>>('/transactions', { params });
  return res.data;
}

export async function getTransaction(id: string) {
  const res = await client.get<{ success: boolean; data: Transaction }>(`/transactions/${id}`);
  return res.data.data;
}

export async function createTransaction(data: {
  type: string; productId: string; quantity: number; unitPrice?: number; note?: string;
}) {
  const res = await client.post<{ success: boolean; data: Transaction }>('/transactions', data);
  return res.data.data;
}

export async function getTransactionStats(days?: number) {
  const res = await client.get<{ success: boolean; data: Array<{ date: string; stockIn: number; stockOut: number; stockInAmount: number; stockOutAmount: number }> }>('/transactions/stats', { params: { days } });
  return res.data.data;
}
