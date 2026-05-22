import type { ParsedFileRow } from '../../types';

interface FilePreviewTableProps {
  rows: ParsedFileRow[];
}

export default function FilePreviewTable({ rows }: FilePreviewTableProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-4">没有可预览的数据</p>;
  }

  const keys = ['sku', 'name', 'quantity', 'unitPrice', 'note'];

  return (
    <div className="max-h-80 overflow-auto border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 sticky top-0">
          <tr>
            {keys.map((k) => (
              <th key={k} className="px-3 py-2 text-left font-medium text-slate-600 text-xs uppercase">{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-t hover:bg-slate-50 ${row.errors.length > 0 ? 'bg-red-50' : ''}`}>
              {keys.map((k) => (
                <td key={k} className={`px-3 py-1.5 ${k === 'sku' && !row.sku ? 'text-red-500' : 'text-slate-700'}`}>
                  {String((row as unknown as Record<string, unknown>)[k] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
