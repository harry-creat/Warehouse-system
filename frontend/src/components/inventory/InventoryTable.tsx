import type { InventoryItem } from '../../types';
import DataTable, { Column } from '../common/DataTable';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { AlertTriangle } from 'lucide-react';

interface InventoryTableProps {
  data: InventoryItem[];
  loading?: boolean;
}

export default function InventoryTable({ data, loading }: InventoryTableProps) {
  const columns: Column<InventoryItem>[] = [
    {
      key: 'sku', header: 'SKU',
      render: (item) => (
        <div className="flex items-center gap-1">
          <span className="font-medium">{item.product.sku}</span>
          {item.currentQuantity <= item.product.minStockLevel && (
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          )}
        </div>
      ),
    },
    { key: 'name', header: '产品名称', render: (item) => item.product.name },
    { key: 'category', header: '分类', render: (item) => item.product.category },
    { key: 'warehouseLocation', header: '库位' },
    { key: 'currentQuantity', header: '当前库存',
      render: (item) => (
        <span className={item.currentQuantity <= item.product.minStockLevel ? 'text-red-600 font-medium' : ''}>
          {formatNumber(item.currentQuantity)} {item.product.unit}
        </span>
      ),
    },
    {
      key: 'unitPrice', header: '单价',
      render: (item) => formatCurrency(Number(item.product.unitPrice)),
    },
    {
      key: 'totalValue', header: '库存价值',
      render: (item) => formatCurrency(item.currentQuantity * Number(item.product.unitPrice)),
    },
  ];

  return <DataTable columns={columns} data={data} keyExtractor={(i) => i.id} loading={loading} emptyMessage="暂无库存记录" />;
}
