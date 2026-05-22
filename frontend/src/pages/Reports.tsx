import { useState } from 'react';
import { useInventorySummary } from '../hooks/useInventory';
import { useTransactionStats } from '../hooks/useTransactions';
import { useInventory } from '../hooks/useInventory';
import { useTransactions } from '../hooks/useTransactions';
import InventoryCard from '../components/inventory/InventoryCard';
import StockTrendChart from '../components/charts/StockTrendChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import TransactionBarChart from '../components/charts/TransactionBarChart';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { FileText, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Reports() {
  const [days, setDays] = useState(30);
  const { data: summary, isLoading } = useInventorySummary();
  const { data: stats } = useTransactionStats(days);
  const { data: invData } = useInventory({ limit: 500 });
  const { data: txData } = useTransactions({ limit: 500 });

  const handleExportReport = () => {
    const wb = XLSX.utils.book_new();

    if (summary) {
      const summaryData = [
        ['指标', '数值'],
        ['产品总数', summary.totalProducts],
        ['库存总量', summary.totalQuantity],
        ['库存总价值', summary.totalValue],
        ['低库存项数', summary.lowStockCount],
        ['今日入库', summary.todayIn],
        ['今日出库', summary.todayOut],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');
    }

    if (txData?.data) {
      const txHeaders = ['日期', '类型', 'SKU', '产品', '数量', '金额', '操作人', '备注'];
      const txRows = txData.data.map((t) => [
        t.createdAt, t.type, t.product?.sku || '', t.product?.name || '',
        t.quantity, Number(t.totalAmount), t.operator || '', t.note || '',
      ]);
      const ws2 = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Transactions');
    }

    if (invData?.data) {
      const invHeaders = ['SKU', '产品', '分类', '库位', '库存', '单价', '价值'];
      const invRows = invData.data.map((i) => [
        i.product.sku, i.product.name, i.product.category, i.warehouseLocation,
        i.currentQuantity, Number(i.product.unitPrice), i.currentQuantity * Number(i.product.unitPrice),
      ]);
      const ws3 = XLSX.utils.aoa_to_sheet([invHeaders, ...invRows]);
      XLSX.utils.book_append_sheet(wb, ws3, 'Inventory');
    }

    XLSX.writeFile(wb, `report-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">报表分析</h1>
        <div className="flex items-center gap-3">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value={7}>最近7天</option>
            <option value={14}>最近14天</option>
            <option value={30}>最近30天</option>
            <option value={90}>最近90天</option>
          </select>
          <button onClick={handleExportReport} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Download className="w-4 h-4" /> 导出完整报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InventoryCard title="库存总价值" value={isLoading ? '-' : formatCurrency(summary?.totalValue || 0)}
          icon={<DollarSign className="w-5 h-5 text-blue-500" />} />
        <InventoryCard title="入库总额"
          value={isLoading ? '-' : formatCurrency(stats?.reduce((s, d) => s + (d.stockInAmount || 0), 0) || 0)}
          icon={<TrendingDown className="w-5 h-5 text-green-500" />} trend="up" />
        <InventoryCard title="出库总额"
          value={isLoading ? '-' : formatCurrency(stats?.reduce((s, d) => s + (d.stockOutAmount || 0), 0) || 0)}
          icon={<TrendingUp className="w-5 h-5 text-red-500" />} trend="down" />
        <InventoryCard title="低库存预警" value={isLoading ? '-' : String(summary?.lowStockCount || 0)}
          icon={<FileText className="w-5 h-5" />} subtitle={summary?.lowStockCount ? '需要补货' : '库存充足'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">{days}日出入库趋势</h2>
          <StockTrendChart data={stats || []} />
        </div>
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">交易柱状图</h2>
          <TransactionBarChart data={stats || []} />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">库存分类占比</h2>
        <div className="max-w-md mx-auto">
          <CategoryPieChart data={invData?.data || []} />
        </div>
      </div>
    </div>
  );
}
