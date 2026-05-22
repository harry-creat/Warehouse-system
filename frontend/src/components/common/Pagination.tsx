import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagination: { page: number; totalPages: number; total: number; pageSize?: number; limit?: number };
  onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = pagination;
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-slate-500">共 {total} 条记录</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-2 py-1 rounded hover:bg-slate-100">1</button>
            {pages[0] > 2 && <span className="px-1">...</span>}
          </>
        )}
        {pages.map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`px-2 py-1 rounded ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
            {p}
          </button>
        ))}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-1">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-2 py-1 rounded hover:bg-slate-100">{totalPages}</button>
          </>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
