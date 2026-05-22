import { Router } from 'express';
import transactionsController from './transactions.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/stats', authenticate, transactionsController.getStats);
router.get('/', authenticate, transactionsController.findAll);
router.get('/:id', authenticate, transactionsController.findById);
router.post('/', authenticate, transactionsController.create);

export default router;
