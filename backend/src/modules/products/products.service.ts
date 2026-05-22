import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProductsService {
  async getProducts(page: number, limit: number, search?: string, category?: string) {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [{ name: { contains: search } }, { sku: { contains: search } }];
    }
    if (category) where.category = category;

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    return { data, total };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  }

  async createProduct(data: {
    sku: string; name: string; category: string; unit?: string;
    unitPrice?: number; description?: string; minStockLevel?: number;
  }) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing) throw Object.assign(new Error('SKU already exists'), { statusCode: 409 });
    return prisma.product.create({
      data: {
        ...data,
        unitPrice: data.unitPrice ?? 0,
        minStockLevel: data.minStockLevel ?? 10,
      },
    });
  }

  async updateProduct(id: string, data: Record<string, unknown>) {
    await this.getProductById(id);
    return prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
    const txCount = await prisma.transaction.count({ where: { productId: id } });
    if (txCount > 0) {
      throw Object.assign(new Error('Cannot delete product with existing transactions'), { statusCode: 409 });
    }
    await prisma.inventory.deleteMany({ where: { productId: id } });
    return prisma.product.delete({ where: { id } });
  }
}

export default new ProductsService();
