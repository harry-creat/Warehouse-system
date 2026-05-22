import { Request, Response, NextFunction } from 'express';
import uploadService from './upload.service';
import { successResponse, paginatedResponse } from '../../utils/response';

export class UploadController {
  uploadStockIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
      const result = await uploadService.processUploadFile(
        req.file.path, req.file.mimetype, req.file.originalname,
        req.file.size, req.user!.userId, 'STOCK_IN',
      );
      return successResponse(res, result, '入库文件处理完成');
    } catch (err) { next(err); }
  };

  uploadStockOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });
      const result = await uploadService.processUploadFile(
        req.file.path, req.file.mimetype, req.file.originalname,
        req.file.size, req.user!.userId, 'STOCK_OUT',
      );
      return successResponse(res, result, '出库文件处理完成');
    } catch (err) { next(err); }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const { data, total } = await uploadService.getUploadHistory(page, limit);
      return paginatedResponse(res, data, page, limit, total);
    } catch (err) { next(err); }
  };

  downloadTemplate = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const buffer = await uploadService.generateTemplate();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="wms-template.xlsx"');
      return res.send(buffer);
    } catch (err) { next(err); }
  };
}

export default new UploadController();
