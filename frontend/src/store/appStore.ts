import { create } from 'zustand';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  createdAt: Date;
}

interface AppState {
  sidebarOpen: boolean;
  notifications: Notification[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (type: Notification['type'], message: string) => void;
  clearNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  notifications: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  addNotification: (type, message) => {
    const id = Date.now().toString();
    set((s) => ({ notifications: [...s.notifications, { id, type, message, createdAt: new Date() }] }));
    setTimeout(() => {
      set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    }, 5000);
  },
  clearNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));
