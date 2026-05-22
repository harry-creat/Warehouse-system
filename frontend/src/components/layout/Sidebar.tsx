import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Package, PackagePlus, PackageMinus,
  ArrowLeftRight, Boxes, BarChart3, ChevronLeft,
} from 'lucide-react';

const allNavItems = [
  { to: '/dashboard', label: '仪表盘', icon: LayoutDashboard, roles: ['ADMIN', 'OPERATOR', 'VIEWER'] },
  { to: '/inventory', label: '库存管理', icon: Package, roles: ['ADMIN', 'OPERATOR', 'VIEWER'] },
  { to: '/stock-in', label: '入库管理', icon: PackagePlus, roles: ['ADMIN', 'OPERATOR'] },
  { to: '/stock-out', label: '出库管理', icon: PackageMinus, roles: ['ADMIN', 'OPERATOR'] },
  { to: '/transactions', label: '交易记录', icon: ArrowLeftRight, roles: ['ADMIN', 'OPERATOR', 'VIEWER'] },
  { to: '/products', label: '产品管理', icon: Boxes, roles: ['ADMIN'] },
  { to: '/reports', label: '报表分析', icon: BarChart3, roles: ['ADMIN', 'OPERATOR', 'VIEWER'] },
];

export default function Sidebar() {
  const location = useLocation();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggle = useAppStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  const navItems = allNavItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className={`fixed left-0 top-0 z-40 h-screen bg-slate-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        {sidebarOpen && <span className="text-lg font-bold">WMS 仓库系统</span>}
        <button onClick={toggle} className="p-1 rounded hover:bg-slate-700">
          <ChevronLeft className={`w-5 h-5 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
      <nav className="mt-4 space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink key={item.to} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
