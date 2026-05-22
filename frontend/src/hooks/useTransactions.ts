import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, getTransaction, createTransaction, getTransactionStats } from '../api/transactions';

export function useTransactions(params?: {
  page?: number; limit?: number; type?: string; productId?: string;
  startDate?: string; endDate?: string;
}) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => getTransaction(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useTransactionStats(days?: number) {
  return useQuery({
    queryKey: ['transactions', 'stats', days],
    queryFn: () => getTransactionStats(days),
    refetchInterval: 30000,
  });
}
