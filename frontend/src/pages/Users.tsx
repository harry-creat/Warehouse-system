import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import DataTable, { Column } from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StatusBadge from '../components/common/StatusBadge';
import type { User } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';
import { formatDate } from '../utils/formatters';

async function getUsers() {
  const res = await client.get<{ success: boolean; data: User[] }>('/auth/users');
  return res.data.data;
}

async function createUser(data: { username: string; email: string; password: string; role: string }) {
  const res = await client.post('/auth/register', data);
  return res.data;
}

async function deleteUser(id: string) {
  await client.delete(`/auth/users/${id}`);
}

export default function UserManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'OPERATOR' });

  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const createMutation = useMutation({ mutationFn: createUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }) });
  const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }) });

  const columns: Column<User>[] = [
    { key: 'username', header: '用户名', render: (u) => <span className="font-medium">{u.username}</span> },
    { key: 'email', header: '邮箱' },
    { key: 'role', header: '角色', render: (u) => <StatusBadge status={u.role} />, className: 'w-24' },
    { key: 'createdAt', header: '创建时间', render: (u) => u.createdAt ? formatDate(u.createdAt) : '-' },
    {
      key: 'actions', header: '操作',
      render: (u) => (
        <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      ),
      className: 'w-16',
    },
  ];

  const resetForm = () => setForm({ username: '', email: '', password: '', role: 'OPERATOR' });

  const handleCreate = async () => {
    await createMutation.mutateAsync(form);
    resetForm();
    setShowCreate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">用户管理</h1>
        <button onClick={() => { setShowCreate(true); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> 新增用户
        </button>
      </div>

      <DataTable columns={columns} data={users || []} keyExtractor={(u) => u.id} loading={isLoading} emptyMessage="暂无用户" />

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold">新增用户</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">用户名 *</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">邮箱 *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">密码 *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">角色</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="ADMIN">管理员</option>
                  <option value="OPERATOR">操作员</option>
                  <option value="VIEWER">查看者</option>
                </select>
              </div>
            </div>
            {createMutation.isError && (
              <p className="text-sm text-red-500">{(createMutation.error as Error)?.message || '创建失败'}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50">取消</button>
              <button onClick={handleCreate} disabled={createMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {createMutation.isPending ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId} title="删除用户" message="确定要删除此用户吗？此操作不可撤销。" variant="danger" confirmLabel="删除"
        onConfirm={async () => { if (deleteId) { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)} loading={deleteMutation.isPending} />
    </div>
  );
}
