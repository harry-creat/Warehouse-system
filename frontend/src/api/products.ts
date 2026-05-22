import client from './client';
import type { PaginatedResponse, Product } from '../types';

export async function getProducts(params?: { page?: number; limit?: number; search?: string; category?: string }) {
  const res = await client.get<PaginatedResponse<Product>>('/products', { params });
  return res.data;
}

export async function getProduct(id: string) {
  const res = await client.get<{ success: boolean; data: Product }>(`/products/${id}`);
  return res.data.data;
}

export async function createProduct(data: Partial<Product>) {
  const res = await client.post<{ success: boolean; data: Product }>('/products', data);
  return res.data.data;
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const res = await client.put<{ success: boolean; data: Product }>(`/products/${id}`, data);
  return res.data.data;
}

export async function deleteProduct(id: string) {
  await client.delete(`/products/${id}`);
}
