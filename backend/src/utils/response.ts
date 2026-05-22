import { Response } from 'express';

export function successResponse<T>(res: Response, data: T, message = '操作成功', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function paginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message = '操作成功'
) {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export function errorResponse(res: Response, message: string, statusCode = 500, errors?: Array<{ field: string; message: string }>) {
  const body: Record<string, unknown> = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}
