export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  description: string | null;
  minStockLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  warehouseLocation: string;
  currentQuantity: number;
  reservedQuantity: number;
  lastUpdatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  operator: string;
  userId?: string;
  user?: { id: string; username: string };
  note?: string;
  sourceFile?: string;
  batchId?: string;
  createdAt: string;
}

export interface UploadRecord {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  status: string;
  parsedRows: number;
  successRows: number;
  failedRows: number;
  errorLog?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ParsedFileRow {
  sku?: string;
  name?: string;
  quantity?: number;
  unitPrice?: number;
  note?: string;
  errors: string[];
}

export interface UploadResult {
  batchId: string;
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export interface InventorySummary {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  todayIn: number;
  todayOut: number;
  lowStockItems: InventoryItem[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ParsedRow = ParsedFileRow;
