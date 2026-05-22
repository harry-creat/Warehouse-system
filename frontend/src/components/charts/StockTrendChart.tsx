import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDateShort } from '../../utils/formatters';

interface TrendData {
  date: string;
  stockIn: number;
  stockOut: number;
}

interface StockTrendChartProps {
  data: TrendData[];
}

export default function StockTrendChart({ data }: StockTrendChartProps) {
  if (data.length === 0) {
    return <div className="text-center text-slate-400 py-8">暂无趋势数据</div>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => v.slice(5)}
            stroke="#94a3b8"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            labelFormatter={(v) => `日期: ${v}`}
            formatter={(value: number, name: string) => [value, name === 'stockIn' ? '入库' : '出库']}
          />
          <Legend formatter={(v: string) => v === 'stockIn' ? '入库' : '出库'} />
          <Line type="monotone" dataKey="stockIn" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="stockOut" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
