import client from './client';
import type { PaginatedResponse, InventoryItem, InventorySummary } from '../types';

export async function getInventory(params?: { page?: number; limit?: number; search?: string; lowStock?: boolean }) {
  const res = await client.get<PaginatedResponse<InventoryItem>>('/inventory', { params });
  return res.data;
}

export async function getInventoryByProduct(productId: string) {
  const res = await client.get<{ success: boolean; data: InventoryItem }>(`/inventory/${productId}`);
  return res.data.data;
}

export async function getInventorySummary() {
  const res = await client.get<{ success: boolean; data: InventorySummary }>('/inventory/summary');
  return res.data.data;
}

export async function getLowStockItems() {
  const res = await client.get<{ success: boolean; data: InventoryItem[] }>('/inventory/low-stock');
  return res.data.data;
}

export async function getAssetValue() {
  const res = await client.get<{ success: boolean; data: { totalAssetValue: number } }>('/inventory/asset-value');
  return res.data.data;
}
