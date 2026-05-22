import { Router } from 'express';
import authController from './auth.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/register', authenticate, authorize('ADMIN'), authController.register);
router.get('/users', authenticate, authorize('ADMIN'), authController.listUsers);
router.delete('/users/:id', authenticate, authorize('ADMIN'), authController.deleteUser);

export default router;
