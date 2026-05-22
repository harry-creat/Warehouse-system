import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface TransactionBarChartProps {
  data: Array<{ date: string; stockIn: number; stockOut: number }>;
}

export default function TransactionBarChart({ data }: TransactionBarChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-slate-400 py-8">暂无交易数据</div>;
  }

  const recent = data.slice(-14);

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <BarChart data={recent}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            labelFormatter={(v) => `日期: ${v}`}
            formatter={(value: number, name: string) => [value, name === 'stockIn' ? '入库' : '出库']}
          />
          <Legend formatter={(v) => v === 'stockIn' ? '入库量' : '出库量'} />
          <Bar dataKey="stockIn" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="stockOut" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
