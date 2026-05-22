import { Request, Response, NextFunction } from 'express';
import inventoryService from './inventory.service';
import { successResponse, paginatedResponse } from '../../utils/response';

export class InventoryController {
  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const lowStock = req.query.lowStock as string | undefined;
      const { data, total } = await inventoryService.getInventoryList(page, limit, search, lowStock === 'true');
      return paginatedResponse(res, data, page, limit, total);
    } catch (err) { next(err); }
  };

  getSummary = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await inventoryService.getInventorySummary();
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  getLowStock = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await inventoryService.getLowStockItems();
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  findByProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await inventoryService.getInventoryByProduct(req.params.productId);
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  getAssetValue = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const value = await inventoryService.getTotalAssetValue();
      return successResponse(res, { totalAssetValue: value });
    } catch (err) { next(err); }
  };
}

export default new InventoryController();
