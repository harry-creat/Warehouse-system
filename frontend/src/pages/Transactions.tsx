import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import DataTable, { Column } from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import type { Transaction } from '../types';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: result, isLoading } = useTransactions({ page, limit: 20, type: type || undefined, startDate: startDate || undefined, endDate: endDate || undefined });

  const columns: Column<Transaction>[] = [
    { key: 'type', header: '类型', render: (t) => <StatusBadge status={t.type} />, className: 'w-20' },
    {
      key: 'product', header: '产品',
      render: (t) => <div><span className="font-medium">{t.product?.name || '-'}</span><br /><span className="text-xs text-slate-400">{t.product?.sku || '-'}</span></div>,
    },
    { key: 'quantity', header: '数量', render: (t) => formatNumber(t.quantity) },
    { key: 'unitPrice', header: '单价', render: (t) => formatCurrency(Number(t.unitPrice)) },
    { key: 'totalAmount', header: '总金额',
      render: (t) => <span className={`font-medium ${t.type === 'STOCK_IN' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'STOCK_IN' ? '+' : '-'}{formatCurrency(Number(t.totalAmount))}</span>,
    },
    { key: 'operator', header: '操作人', render: (t) => t.operator || t.user?.username || '-' },
    { key: 'source', header: '来源', render: (t) => t.sourceFile ? <span className="text-xs text-blue-600">文件导入</span> : <span className="text-xs text-slate-400">手动</span> },
    { key: 'createdAt', header: '时间', render: (t) => formatDate(t.createdAt) },
  ];

  const handleExport = () => {
    if (!result?.data) return;
    const headers = ['类型', 'SKU', '产品', '数量', '单价', '总金额', '操作人', '来源', '备注', '时间'];
    const rows = result.data.map((t) => [
      t.type, t.product?.sku || '', t.product?.name || '', t.quantity, Number(t.unitPrice),
      Number(t.totalAmount), t.operator || '', t.sourceFile ? '文件' : '手动', t.note || '', t.createdAt,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, `transactions-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">交易记录</h1>
        <button onClick={handleExport} className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" /> 导出Excel
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">全部类型</option>
          <option value="STOCK_IN">入库</option>
          <option value="STOCK_OUT">出库</option>
          <option value="ADJUSTMENT">调整</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <DataTable columns={columns} data={result?.data || []} keyExtractor={(t) => t.id} loading={isLoading} emptyMessage="暂无交易记录" />
      {result?.pagination && <Pagination pagination={{ page: result.pagination.page, totalPages: result.pagination.totalPages, total: result.pagination.total, pageSize: result.pagination.limit }} onPageChange={setPage} />}
    </div>
  );
}
