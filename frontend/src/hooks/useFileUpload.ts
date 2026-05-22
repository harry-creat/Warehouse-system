import { useState, useCallback } from 'react';
import { uploadStockIn, uploadStockOut } from '../api/upload';
import type { UploadResult } from '../types';

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File, transactionType: 'STOCK_IN' | 'STOCK_OUT') => {
    setIsUploading(true);
    setProgress(30);
    setError(null);
    setResult(null);
    try {
      setProgress(50);
      const res = transactionType === 'STOCK_IN' ? await uploadStockIn(file) : await uploadStockOut(file);
      setProgress(80);
      setResult(res);
      setProgress(100);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return { isUploading, progress, result, error, upload, reset };
}
