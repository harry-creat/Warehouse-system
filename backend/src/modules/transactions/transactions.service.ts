import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TransactionsService {
  async createTransaction(
    type: string,
    productId: string,
    quantity: number,
    unitPrice: number | undefined,
    userId: string | undefined,
    note?: string,
    sourceFile?: string,
    batchId?: string,
    operatorName?: string,
  ) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    const price = unitPrice ?? Number(product.unitPrice);
    const totalAmount = quantity * price;

    const tx = await prisma.$transaction(async (txPrisma) => {
      const inventory = await txPrisma.inventory.findUnique({ where: { productId } });

      if (type === 'STOCK_OUT' || type === 'ADJUSTMENT') {
        const available = (inventory?.currentQuantity || 0) - (inventory?.reservedQuantity || 0);
        if (type === 'STOCK_OUT' && quantity > available) {
          throw Object.assign(new Error(`Insufficient stock: available ${available}, requested ${quantity}`), { statusCode: 400 });
        }
      }

      const transaction = await txPrisma.transaction.create({
        data: {
          type: type as 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT',
          productId,
          quantity,
          unitPrice: price,
          totalAmount,
          operator: operatorName || 'system',
          userId,
          note: note || null,
          sourceFile: sourceFile || null,
          batchId: batchId || null,
        },
        include: { product: true },
      });

      const qtyChange = type === 'STOCK_IN' ? quantity : -quantity;
      if (inventory) {
        await txPrisma.inventory.update({
          where: { id: inventory.id },
          data: { currentQuantity: { increment: qtyChange } },
        });
      } else if (type === 'STOCK_IN') {
        await txPrisma.inventory.create({
          data: { productId, currentQuantity: quantity },
        });
      }

      return transaction;
    });

    return tx;
  }

  async getTransactions(
    page: number, limit: number,
    type?: string, productId?: string,
    startDate?: string, endDate?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (productId) where.productId = productId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { product: true, user: { select: { id: true, username: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);
    return { data, total };
  }

  async getTransactionById(id: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id },
      include: { product: true, user: { select: { id: true, username: true } } },
    });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
    return tx;
  }

  async getTransactionStats(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const transactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, type: true, quantity: true, totalAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, { date: string; stockIn: number; stockOut: number; stockInAmount: number; stockOutAmount: number }>();
    for (const tx of transactions) {
      const day = tx.createdAt.toISOString().slice(0, 10);
      if (!dailyMap.has(day)) {
        dailyMap.set(day, { date: day, stockIn: 0, stockOut: 0, stockInAmount: 0, stockOutAmount: 0 });
      }
      const entry = dailyMap.get(day)!;
      if (tx.type === 'STOCK_IN') {
        entry.stockIn += tx.quantity;
        entry.stockInAmount += Number(tx.totalAmount);
      } else if (tx.type === 'STOCK_OUT') {
        entry.stockOut += tx.quantity;
        entry.stockOutAmount += Number(tx.totalAmount);
      }
    }

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}

export default new TransactionsService();
