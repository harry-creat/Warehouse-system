import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { logout } from '../../api/auth';
import { LogOut, User, Menu, Bell } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const notifications = useAppStore((s) => s.notifications);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    clearAuth();
    navigate('/login');
  };

  const roleLabels: Record<string, string> = { ADMIN: '管理员', OPERATOR: '操作员', VIEWER: '查看者' };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-30">
      <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-slate-100 lg:hidden">
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3" ref={dropdownRef}>
        <div className="relative">
          <button onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false); }}
            className="relative p-2 rounded-lg hover:bg-slate-100">
            <Bell className="w-5 h-5 text-slate-600" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {showNotifications && notifications.length > 0 && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-lg border py-2 z-50">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="px-4 py-2 text-sm hover:bg-slate-50">
                  <p className="text-slate-700">{n.message}</p>
                  <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{user?.username || '用户'}</p>
              <p className="text-xs text-slate-400">{roleLabels[user?.role || ''] || user?.role}</p>
            </div>
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border py-1 z-50">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <LogOut className="w-4 h-4" /> 退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
