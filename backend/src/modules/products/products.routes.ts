import { Router } from 'express';
import productsController from './products.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, productsController.findAll);
router.get('/:id', authenticate, productsController.findById);
router.post('/', authenticate, authorize('ADMIN'), productsController.create);
router.put('/:id', authenticate, authorize('ADMIN'), productsController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), productsController.delete);

export default router;
