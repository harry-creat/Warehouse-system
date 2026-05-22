import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const operatorHash = await bcrypt.hash('Oper@123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@wms.com' },
    update: {},
    create: { username: 'admin', email: 'admin@wms.com', passwordHash: adminHash, role: 'ADMIN' },
  });
  console.log('Created admin user:', admin.email);

  const operator = await prisma.user.upsert({
    where: { email: 'operator@wms.com' },
    update: {},
    create: { username: 'operator', email: 'operator@wms.com', passwordHash: operatorHash, role: 'OPERATOR' },
  });
  console.log('Created operator user:', operator.email);

  const products = [
    { sku: 'ELEC-001', name: '无线蓝牙耳机', category: 'Electronics电子', unit: 'pcs', unitPrice: 299.00, description: '降噪蓝牙耳机', minStockLevel: 20 },
    { sku: 'ELEC-002', name: 'USB-C 数据线', category: 'Electronics电子', unit: 'pcs', unitPrice: 29.90, description: '1米快充数据线', minStockLevel: 50 },
    { sku: 'ELEC-003', name: '移动电源 10000mAh', category: 'Electronics电子', unit: 'pcs', unitPrice: 159.00, description: '便携充电宝', minStockLevel: 15 },
    { sku: 'MECH-001', name: '精密轴承 6205', category: 'Mechanical机械', unit: 'pcs', unitPrice: 35.00, description: '高速深沟球轴承', minStockLevel: 30 },
    { sku: 'MECH-002', name: '不锈钢螺丝 M8x30', category: 'Mechanical机械', unit: 'box', unitPrice: 12.50, description: '304不锈钢螺丝 100颗/盒', minStockLevel: 40 },
    { sku: 'MECH-003', name: '工业润滑油 1L', category: 'Mechanical机械', unit: 'pcs', unitPrice: 85.00, description: '高温链条润滑油', minStockLevel: 10 },
    { sku: 'CONS-001', name: '打印纸 A4', category: 'Consumables耗材', unit: 'pcs', unitPrice: 24.90, description: '70g双面打印纸 500张', minStockLevel: 100 },
    { sku: 'CONS-002', name: '签字笔 黑色', category: 'Consumables耗材', unit: 'box', unitPrice: 12.50, description: '0.5mm 12支/盒', minStockLevel: 50 },
    { sku: 'CONS-003', name: '工业手套', category: 'Consumables耗材', unit: 'pcs', unitPrice: 5.50, description: '防滑耐磨工作手套', minStockLevel: 200 },
    { sku: 'CONS-004', name: '清洁剂 500ml', category: 'Consumables耗材', unit: 'pcs', unitPrice: 18.00, description: '多功能工业清洁剂', minStockLevel: 30 },
  ];

  const createdProducts: Array<{ id: string; name: string; unitPrice: number | { toNumber: () => number } }> = [];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
    createdProducts.push({
      id: product.id,
      name: product.name,
      unitPrice: product.unitPrice,
    } as unknown as typeof createdProducts[0]);
    console.log('Created product:', product.name);
  }

  for (const product of createdProducts) {
    const qty = Math.floor(Math.random() * 150) + 20;
    const price = typeof product.unitPrice === 'object' && product.unitPrice !== null && 'toNumber' in product.unitPrice
      ? (product.unitPrice as unknown as { toNumber: () => number }).toNumber()
      : Number(product.unitPrice);

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        warehouseLocation: `A-${String(Math.floor(Math.random() * 5) + 1).padStart(2, '0')}`,
        currentQuantity: qty,
      },
    });
  }
  console.log('\nInitialized inventory for all products');

  const types = ['STOCK_IN', 'STOCK_OUT'] as const;
  let txCount = 0;

  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const quantity = Math.floor(Math.random() * 20) + 1;
      const price = typeof product.unitPrice === 'object' && product.unitPrice !== null && 'toNumber' in product.unitPrice
        ? (product.unitPrice as unknown as { toNumber: () => number }).toNumber()
        : Number(product.unitPrice);

      const inv = await prisma.inventory.findUnique({ where: { productId: product.id } });
      if (inv) {
        const newQty = type === 'STOCK_IN' ? inv.currentQuantity + quantity : Math.max(0, inv.currentQuantity - quantity);
        await prisma.inventory.update({
          where: { id: inv.id },
          data: { currentQuantity: newQty },
        });
      }

      await prisma.transaction.create({
        data: {
          type,
          productId: product.id,
          quantity,
          unitPrice: price,
          totalAmount: quantity * price,
          operator: 'admin',
          userId: admin.id,
          note: daysAgo === 0 ? '今日交易' : `${daysAgo}天前交易`,
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
      txCount++;
    }
  }

  console.log(`Created ${txCount} transactions over 30 days\n`);
  console.log('Seeding complete!');
  console.log('── Login credentials ──');
  console.log('  Admin:    admin@wms.com / Admin@123456');
  console.log('  Operator: operator@wms.com / Oper@123456');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
