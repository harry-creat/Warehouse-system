import { Request, Response, NextFunction } from 'express';
import transactionsService from './transactions.service';
import { successResponse, paginatedResponse } from '../../utils/response';

export class TransactionsController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, productId, quantity, unitPrice, note } = req.body;
      const result = await transactionsService.createTransaction(
        type, productId, quantity, unitPrice, req.user?.userId, note,
      );
      return successResponse(res, result, '交易创建成功', 201);
    } catch (err) { next(err); }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const type = req.query.type as string | undefined;
      const productId = req.query.productId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const { data, total } = await transactionsService.getTransactions(page, limit, type, productId, startDate, endDate);
      return paginatedResponse(res, data, page, limit, total);
    } catch (err) { next(err); }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await transactionsService.getTransactionById(req.params.id);
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = Number(req.query.days) || 30;
      const result = await transactionsService.getTransactionStats(days);
      return successResponse(res, result);
    } catch (err) { next(err); }
  };
}

export default new TransactionsController();
