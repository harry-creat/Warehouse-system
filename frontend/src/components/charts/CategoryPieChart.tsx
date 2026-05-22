import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { InventoryItem } from '../../types';

interface CategoryPieChartProps { data: InventoryItem[]; }

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const categoryMap = new Map<string, number>();
  data.forEach((item) => {
    const cat = item.product.category || '未分类';
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + item.currentQuantity);
  });

  const chartData = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return <div className="text-center text-slate-400 py-8">暂无分类数据</div>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={90}
            dataKey="value" nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(value: number) => value} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
