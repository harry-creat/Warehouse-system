interface InventoryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export default function InventoryCard({ title, value, subtitle, icon, trend, className = '' }: InventoryCardProps) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
      {subtitle && (
        <p className={`text-xs mt-1 ${
          trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-400'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
