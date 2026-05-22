import { useQuery } from '@tanstack/react-query';
import { getInventory, getInventoryByProduct, getInventorySummary, getLowStockItems } from '../api/inventory';

export function useInventory(params?: { page?: number; limit?: number; search?: string; lowStock?: boolean }) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => getInventory(params),
  });
}

export function useInventoryItem(productId: string) {
  return useQuery({
    queryKey: ['inventory', productId],
    queryFn: () => getInventoryByProduct(productId),
    enabled: !!productId,
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: getInventorySummary,
    refetchInterval: 15000,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: getLowStockItems,
    refetchInterval: 30000,
  });
}
