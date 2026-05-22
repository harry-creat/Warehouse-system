interface StatusBadgeProps {
  status: string;
}

const colorMap: Record<string, string> = {
  STOCK_IN: 'bg-green-100 text-green-700',
  STOCK_OUT: 'bg-orange-100 text-orange-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  FAILED: 'bg-red-100 text-red-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  OPERATOR: 'bg-blue-100 text-blue-700',
  VIEWER: 'bg-slate-100 text-slate-700',
};

const labelMap: Record<string, string> = {
  STOCK_IN: '入库',
  STOCK_OUT: '出库',
  PENDING: '待确认',
  CONFIRMED: '已确认',
  FAILED: '失败',
  ADMIN: '管理员',
  OPERATOR: '操作员',
  VIEWER: '查看者',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${colorMap[status] || 'bg-slate-100 text-slate-600'}`}>
      {labelMap[status] || status}
    </span>
  );
}
