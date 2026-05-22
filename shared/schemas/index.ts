import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const createProductSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  unit: z.string().default('pcs'),
  unitPrice: z.number().min(0).default(0),
  description: z.string().optional(),
  minStockLevel: z.number().int().min(0).default(10),
});

export const updateProductSchema = createProductSchema.partial();

export const createTransactionSchema = z.object({
  type: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT']),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0).optional(),
  note: z.string().optional(),
});

export const uploadQuerySchema = z.object({
  type: z.enum(['STOCK_IN', 'STOCK_OUT']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UploadQueryInput = z.infer<typeof uploadQuerySchema>;
