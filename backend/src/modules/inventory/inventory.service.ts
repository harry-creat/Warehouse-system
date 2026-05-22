import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InventoryService {
  async getInventoryList(page: number, limit: number, search?: string, lowStockOnly?: boolean) {
    const where: Record<string, unknown> = {};
    if (search) {
      where.product = { OR: [{ name: { contains: search } }, { sku: { contains: search } }] };
    }
    if (lowStockOnly) {
      where.product = { ...((where.product as Record<string, unknown>) || {}), minStockLevel: { gt: 0 } };
    }

    let [data, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: { product: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastUpdatedAt: 'desc' },
      }),
      prisma.inventory.count({ where }),
    ]);

    if (lowStockOnly) {
      data = data.filter((i) => i.currentQuantity <= i.product.minStockLevel);
      total = data.length;
    }

    return { data, total };
  }

  async getInventoryByProduct(productId: string) {
    const inv = await prisma.inventory.findUnique({ where: { productId }, include: { product: true } });
    if (!inv) throw Object.assign(new Error('Inventory record not found'), { statusCode: 404 });
    return inv;
  }

  async getTotalAssetValue() {
    const items = await prisma.inventory.findMany({ include: { product: true } });
    return items.reduce((sum, i) => sum + i.currentQuantity * Number(i.product.unitPrice), 0);
  }

  async getLowStockItems() {
    const items = await prisma.inventory.findMany({
      include: { product: true },
    });
    return items.filter((i) => i.currentQuantity <= i.product.minStockLevel);
  }

  async getInventorySummary() {
    const [totalProducts, items, lowStock, transactions] = await Promise.all([
      prisma.product.count(),
      prisma.inventory.findMany({ include: { product: true } }),
      this.getLowStockItems(),
      prisma.transaction.findMany({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        select: { type: true, quantity: true },
      }),
    ]);

    const totalQuantity = items.reduce((s, i) => s + i.currentQuantity, 0);
    const totalValue = items.reduce((s, i) => s + i.currentQuantity * Number(i.product.unitPrice), 0);

    const todayIn = transactions.filter((t) => t.type === 'STOCK_IN').reduce((s, t) => s + t.quantity, 0);
    const todayOut = transactions.filter((t) => t.type === 'STOCK_OUT').reduce((s, t) => s + t.quantity, 0);

    return {
      totalProducts,
      totalQuantity,
      totalValue,
      lowStockCount: lowStock.length,
      todayIn,
      todayOut,
      lowStockItems: lowStock.slice(0, 10),
    };
  }
}

export default new InventoryService();
