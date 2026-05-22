import { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import DataTable, { Column } from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatCurrency } from '../utils/formatters';
import type { Product } from '../types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', category: '', unit: 'pcs', unitPrice: '0', description: '', minStockLevel: '10' });

  const { data: result, isLoading } = useProducts({ page, limit: 20, search: search || undefined });
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const resetForm = () => setForm({ sku: '', name: '', category: '', unit: 'pcs', unitPrice: '0', description: '', minStockLevel: '10' });

  const handleCreate = async () => {
    await createProduct.mutateAsync({ sku: form.sku, name: form.name, category: form.category, unit: form.unit, unitPrice: Number(form.unitPrice), description: form.description, minStockLevel: Number(form.minStockLevel) });
    resetForm(); setShowCreate(false);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    await updateProduct.mutateAsync({ id: editItem.id, data: { sku: form.sku, name: form.name, category: form.category, unit: form.unit, unitPrice: Number(form.unitPrice), description: form.description, minStockLevel: Number(form.minStockLevel) } });
    resetForm(); setEditItem(null);
  };

  const columns: Column<Product>[] = [
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-mono font-medium">{p.sku}</span> },
    { key: 'name', header: '名称', render: (p) => p.name },
    { key: 'category', header: '分类', render: (p) => p.category },
    { key: 'unitPrice', header: '单价', render: (p) => formatCurrency(Number(p.unitPrice)) },
    { key: 'unit', header: '单位' },
    { key: 'minStockLevel', header: '最低库存' },
    { key: 'actions', header: '操作',
      render: (p) => (
        <div className="flex gap-1">
          <button onClick={() => { setEditItem(p); setForm({ sku: p.sku, name: p.name, category: p.category, unit: p.unit, unitPrice: String(p.unitPrice), description: p.description || '', minStockLevel: String(p.minStockLevel) }); }}
            className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">产品管理</h1>
        <button onClick={() => { setShowCreate(true); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> 新增产品
        </button>
      </div>

      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="搜索 SKU 或产品名称..." />

      <DataTable columns={columns} data={result?.data || []} keyExtractor={(p) => p.id} loading={isLoading} emptyMessage="暂无产品" />
      {result?.pagination && <Pagination pagination={{ page: result.pagination.page, totalPages: result.pagination.totalPages, total: result.pagination.total, pageSize: result.pagination.limit }} onPageChange={setPage} />}

      {(showCreate || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowCreate(false); setEditItem(null); }} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold">{editItem ? '编辑产品' : '新增产品'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">SKU *</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full border rounded px-3 py-1.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">名称 *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-1.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">分类 *</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded px-3 py-1.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">单位</label>
                <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full border rounded px-3 py-1.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">单价</label>
                <input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} className="w-full border rounded px-3 py-1.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">最低库存</label>
                <input type="number" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} className="w-full border rounded px-3 py-1.5 text-sm" /></div>
            </div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">描述</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border rounded px-3 py-1.5 text-sm" /></div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowCreate(false); setEditItem(null); }} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={editItem ? handleUpdate : handleCreate} disabled={createProduct.isPending || updateProduct.isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{editItem ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="删除产品" message="确定要删除此产品吗？此操作不可撤销。" variant="danger" confirmLabel="删除"
        onConfirm={async () => { if (deleteId) { await deleteProduct.mutateAsync(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)} loading={deleteProduct.isPending} />
    </div>
  );
}
