import { useState } from 'react';
import { useCreateTransaction } from '../hooks/useTransactions';
import { useFileUpload } from '../hooks/useFileUpload';
import FileUploadZone from '../components/upload/FileUploadZone';
import FilePreviewTable from '../components/upload/FilePreviewTable';
import UploadProgressComp from '../components/upload/UploadProgress';
import { useProducts } from '../hooks/useProducts';
import { downloadTemplate } from '../api/upload';
import { ArrowDownCircle, CheckCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { ParsedFileRow } from '../types';

export default function StockIn() {
  const [mode, setMode] = useState<'manual' | 'file'>('manual');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [note, setNote] = useState('');
  const [previewRows, setPreviewRows] = useState<ParsedFileRow[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { data: productData } = useProducts({ limit: 200 });
  const createTx = useCreateTransaction();
  const fileUpload = useFileUpload();

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTx.mutateAsync({
      type: 'STOCK_IN', productId, quantity: Number(quantity),
      unitPrice: unitPrice ? Number(unitPrice) : undefined, note,
    });
    setProductId(''); setQuantity(''); setUnitPrice(''); setNote('');
  };

  const handleFileSelect = (file: File) => {
    setPendingFile(file);
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' }).map((r) => ({
          sku: String(r.SKU || r.sku || ''),
          name: String(r['品名'] || r.name || ''),
          quantity: Number(r['数量'] || r.quantity) || 0,
          unitPrice: Number(r['单价'] || r.unitPrice) || undefined,
          note: String(r['备注'] || r.note || ''),
          errors: [] as string[],
        }));
        setPreviewRows(rows);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setPreviewRows([]);
    }
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    await fileUpload.upload(pendingFile, 'STOCK_IN');
    setPendingFile(null);
    setPreviewRows([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ArrowDownCircle className="w-7 h-7 text-green-600" />
        <h1 className="text-2xl font-bold text-slate-900">入库管理</h1>
      </div>

      <div className="flex gap-2 border-b pb-2">
        <button className={`px-4 py-2 text-sm font-medium rounded-t-lg ${mode === 'manual' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
          onClick={() => setMode('manual')}>手动入库</button>
        <button className={`px-4 py-2 text-sm font-medium rounded-t-lg ${mode === 'file' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
          onClick={() => setMode('file')}>文件导入</button>
      </div>

      {mode === 'manual' ? (
        <form onSubmit={handleManualSubmit} className="bg-white rounded-xl border p-6 space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">选择产品 *</label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">请选择产品</option>
                {productData?.data?.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">入库数量 *</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="1" step="1"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">单价</label>
              <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} min="0" step="0.01"
                placeholder="留空使用默认价" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注信息"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {createTx.isError && <p className="text-sm text-red-500">{(createTx.error as Error)?.message || '操作失败'}</p>}
          {createTx.isSuccess && <p className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 入库成功</p>}
          <button type="submit" disabled={createTx.isPending}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
            {createTx.isPending ? '处理中...' : '确认入库'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => downloadTemplate()} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
              <Download className="w-4 h-4" /> 下载导入模板
            </button>
          </div>

          <FileUploadZone onFile={handleFileSelect} disabled={fileUpload.isUploading} />

          {fileUpload.isUploading && <UploadProgressComp progress={fileUpload.progress}
            status={fileUpload.result ? 'done' : previewRows.length > 0 ? 'confirming' : 'uploading'}
            error={fileUpload.error || undefined} />}

          {previewRows.length > 0 && !fileUpload.result && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">预览数据 ({previewRows.length} 行)</h3>
              <FilePreviewTable rows={previewRows} />
              <button onClick={handleUpload} disabled={fileUpload.isUploading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
                确认导入
              </button>
            </div>
          )}

          {fileUpload.result && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-green-700">导入完成</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center"><span className="text-slate-500">总计</span><p className="text-xl font-bold">{fileUpload.result.total}</p></div>
                <div className="text-center"><span className="text-green-500">成功</span><p className="text-xl font-bold text-green-600">{fileUpload.result.success}</p></div>
                <div className="text-center"><span className="text-red-500">失败</span><p className="text-xl font-bold text-red-600">{fileUpload.result.failed}</p></div>
              </div>
              {fileUpload.result.errors.length > 0 && (
                <div className="mt-3 max-h-40 overflow-auto text-xs text-red-600 bg-red-50 p-2 rounded">
                  {fileUpload.result.errors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}
              <button onClick={fileUpload.reset} className="mt-3 px-4 py-1.5 text-sm border rounded-lg hover:bg-slate-50">继续导入</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
