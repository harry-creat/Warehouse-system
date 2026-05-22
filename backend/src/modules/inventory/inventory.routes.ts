import { Router } from 'express';
import inventoryController from './inventory.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/summary', authenticate, inventoryController.getSummary);
router.get('/low-stock', authenticate, inventoryController.getLowStock);
router.get('/asset-value', authenticate, inventoryController.getAssetValue);
router.get('/', authenticate, inventoryController.findAll);
router.get('/:productId', authenticate, inventoryController.findByProduct);

export default router;
