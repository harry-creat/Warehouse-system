import { AlertTriangle } from 'lucide-react';
import type { InventoryItem } from '../../types';

interface LowStockAlertProps {
  items: InventoryItem[];
  onItemClick?: (id: string) => void;
}

export default function LowStockAlert({ items, onItemClick }: LowStockAlertProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-amber-600" />
        <span className="font-semibold text-amber-800">低库存警告</span>
        <span className="text-sm text-amber-600">({items.length} 项)</span>
      </div>
      <div className="space-y-1">
        {items.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm cursor-pointer hover:bg-amber-100 px-2 py-1 rounded"
            onClick={() => onItemClick?.(item.id)}
          >
            <span className="text-slate-700">
              {item.product.name} <span className="text-slate-400">({item.product.sku})</span>
            </span>
            <span className="text-red-600 font-medium">
              {item.currentQuantity} / 最低 {item.product.minStockLevel} {item.product.unit}
            </span>
          </div>
        ))}
        {items.length > 5 && (
          <p className="text-xs text-slate-400 text-center">...还有 {items.length - 5} 项</p>
        )}
      </div>
    </div>
  );
}
