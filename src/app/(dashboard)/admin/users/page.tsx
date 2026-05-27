'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

const roleColors: Record<string, string> = {
  user: 'bg-slate-500',
  agent: 'bg-blue-500',
  admin: 'bg-purple-500',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserRole, setSelectedUserRole] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Gestionar Usuarios</h1>
        <p className="text-slate-400">Total de usuarios: {users.length}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-900/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">{user.full_name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
                <Select
                  value={selectedUserRole[user.id] || user.role}
                  onChange={(e) => {
                    setSelectedUserRole({ ...selectedUserRole, [user.id]: e.target.value });
                    handleRoleChange(user.id, e.target.value);
                  }}
                  options={[
                    { value: 'user', label: 'Usuario' },
                    { value: 'agent', label: 'Agente' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                  className="w-32"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
