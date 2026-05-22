import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/products.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import transactionRoutes from './modules/transactions/transactions.routes';
import uploadRoutes from './modules/upload/upload.routes';
import logger from './utils/logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`WMS Backend running on port ${env.PORT}`);
});

export default app;
