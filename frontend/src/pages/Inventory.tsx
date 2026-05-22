import { useState } from 'react';
import { useInventory, useLowStock } from '../hooks/useInventory';
import InventoryTable from '../components/inventory/InventoryTable';
import LowStockAlert from '../components/inventory/LowStockAlert';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { Download, RefreshCw } from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils/formatters';
import * as XLSX from 'xlsx';

export default function Inventory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const { data: result, isLoading, refetch } = useInventory({ page, limit: 20, search: search || undefined, lowStock: showLowStock });
  const { data: lowStockItems } = useLowStock();

  const handleExport = () => {
    if (!result?.data) return;
    const headers = ['SKU', '产品名称', '分类', '库位', '当前库存', '可用数量', '单价', '库存价值'];
    const rows = result.data.map((item) => [
      item.product.sku, item.product.name, item.product.category, item.warehouseLocation,
      item.currentQuantity, item.currentQuantity - item.reservedQuantity,
      Number(item.product.unitPrice), item.currentQuantity * Number(item.product.unitPrice),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `inventory-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const totalQty = result?.data?.reduce((s, i) => s + i.currentQuantity, 0) || 0;
  const totalValue = result?.data?.reduce((s, i) => s + i.currentQuantity * Number(i.product.unitPrice), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">库存管理</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-1 px-3 py-2 text-sm border rounded-lg hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" /> 刷新
          </button>
          <button onClick={handleExport} className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" /> 导出Excel
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-500 bg-white rounded-lg border px-4 py-2">
        <span>总计: <strong>{result?.pagination?.total || 0}</strong> 项</span>
        <span>总数量: <strong>{formatNumber(totalQty)}</strong></span>
        <span>总价值: <strong>{formatCurrency(totalValue)}</strong></span>
      </div>

      {lowStockItems && lowStockItems.length > 0 && (
        <LowStockAlert items={lowStockItems} onItemClick={() => {}} />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="搜索 SKU 或产品名称..." />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showLowStock}
            onChange={(e) => { setShowLowStock(e.target.checked); setPage(1); }} className="rounded" />
          仅显示低库存
        </label>
      </div>

      <InventoryTable data={result?.data || []} loading={isLoading} />
      {result?.pagination && <Pagination pagination={{
        page: result.pagination.page, totalPages: result.pagination.totalPages, total: result.pagination.total,
        pageSize: result.pagination.limit as unknown as undefined,
      }} onPageChange={setPage} />}
    </div>
  );
}
