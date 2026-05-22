import { Request, Response, NextFunction } from 'express';
import productsService from './products.service';
import { successResponse, paginatedResponse } from '../../utils/response';

export class ProductsController {
  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const { data, total } = await productsService.getProducts(page, limit, search, category);
      return paginatedResponse(res, data, page, limit, total);
    } catch (err) { next(err); }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.getProductById(req.params.id);
      return successResponse(res, result);
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.createProduct(req.body);
      return successResponse(res, result, '创建成功', 201);
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await productsService.updateProduct(req.params.id, req.body);
      return successResponse(res, result, '更新成功');
    } catch (err) { next(err); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await productsService.deleteProduct(req.params.id);
      return successResponse(res, null, '删除成功');
    } catch (err) { next(err); }
  };
}

export default new ProductsController();
