import { useInventorySummary } from '../hooks/useInventory';
import { useTransactionStats } from '../hooks/useTransactions';
import { useInventory } from '../hooks/useInventory';
import InventoryCard from '../components/inventory/InventoryCard';
import LowStockAlert from '../components/inventory/LowStockAlert';
import StockTrendChart from '../components/charts/StockTrendChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TransactionBarChart from '../components/charts/TransactionBarChart';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Package, ArrowDownCircle, ArrowUpCircle, TrendingUp, Boxes, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { data: summary, isLoading } = useInventorySummary();
  const { data: stats } = useTransactionStats(30);
  const { data: invData } = useInventory({ limit: 200 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">仪表盘</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InventoryCard title="产品总数" value={isLoading ? '-' : formatNumber(summary?.totalProducts || 0)}
          icon={<Package className="w-5 h-5" />} subtitle={`${summary?.lowStockCount || 0} 项低库存`} />
        <InventoryCard title="库存总量" value={isLoading ? '-' : formatNumber(summary?.totalQuantity || 0)}
          icon={<Boxes className="w-5 h-5" />}
          subtitle={`总价值: ${formatCurrency(summary?.totalValue || 0)}`} />
        <InventoryCard title="今日入库" value={isLoading ? '-' : formatNumber(summary?.todayIn || 0)}
          icon={<ArrowDownCircle className="w-5 h-5 text-green-500" />} trend="up" />
        <InventoryCard title="今日出库" value={isLoading ? '-' : formatNumber(summary?.todayOut || 0)}
          icon={<ArrowUpCircle className="w-5 h-5 text-red-500" />} trend="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">30日出入库趋势</h2>
          <StockTrendChart data={stats || []} />
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">低库存预警</h2>
          <LowStockAlert items={summary?.lowStockItems || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">库存分类占比</h2>
          <CategoryPieChart data={invData?.data || []} />
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">交易量柱状图</h2>
          <TransactionBarChart data={stats || []} />
        </div>
      </div>
    </div>
  );
}
