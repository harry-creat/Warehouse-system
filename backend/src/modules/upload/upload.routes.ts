import { Router } from 'express';
import uploadController from './upload.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

router.post('/stock-in', authenticate, authorize('ADMIN', 'OPERATOR'), upload.single('file'), uploadController.uploadStockIn);
router.post('/stock-out', authenticate, authorize('ADMIN', 'OPERATOR'), upload.single('file'), uploadController.uploadStockOut);
router.get('/history', authenticate, uploadController.getHistory);
router.get('/template', authenticate, uploadController.downloadTemplate);

export default router;
