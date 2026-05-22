import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../api/products';

export function useProducts(params?: { page?: number; limit?: number; search?: string; category?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: createProduct, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }) });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => updateProduct(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: deleteProduct, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }) });
}
