'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setUserRole(profile?.role || 'user');

      // Fetch tickets based on role
      let query = supabase
        .from('tickets')
        .select(
          `
          id,
          title,
          priority,
          status,
          created_at,
          created_by,
          assigned_to,
          profiles:created_by(full_name),
          agent:assigned_to(full_name)
        `
        );

      // Users only see their tickets, agents/admins see all
      if (profile?.role === 'user') {
        query = query.eq('created_by', user.id);
      }

      // Apply filters
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      if (filterPriority !== 'all') {
        query = query.eq('priority', filterPriority);
      }

      const { data } = await query.order('created_at', { ascending: false });
      setTickets(data || []);
      setIsLoading(false);
    };

    fetchData();
  }, [filterStatus, filterPriority]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return 'success';
      case 'resolved':
        return 'success';
      case 'in_progress':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Tickets</h1>
          <p className="text-slate-400">Gestiona todos tus tickets de soporte</p>
        </div>
        <Link href="/dashboard/tickets/new">
          <Button>Nuevo Ticket</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase block mb-2">
            Estado
          </label>
          <select
            className={`
              w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
              border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
              transition-all duration-200 backdrop-blur-sm
              focus:outline-none focus:ring-2 focus:ring-primary/40
            `}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="open">Abierto</option>
            <option value="in_progress">En Progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase block mb-2">
            Prioridad
          </label>
          <select
            className={`
              w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
              border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
              transition-all duration-200 backdrop-blur-sm
              focus:outline-none focus:ring-2 focus:ring-primary/40
            `}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mis Tickets</span>
            <Badge variant="info">{tickets.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-400">Cargando tickets...</p>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-4">No hay tickets</p>
              <Link href="/dashboard/tickets/new">
                <Button>Crear un Ticket</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 md:overflow-x-auto">
              <table className="w-full text-xs md:text-sm hidden md:table">
                <thead className="border-b border-slate-700">
                  <tr className="text-slate-400">
                    <th className="px-4 py-3 text-left">Título</th>
                    <th className="px-4 py-3 text-left">Prioridad</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    {userRole !== 'user' && <th className="px-4 py-3 text-left">Usuario</th>}
                    {userRole !== 'user' && <th className="px-4 py-3 text-left">Asignado a</th>}
                    <th className="px-4 py-3 text-left">Creado</th>
                    <th className="px-4 py-3 text-left">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {tickets.map((ticket: any) => (
                    <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="text-indigo-400 hover:text-indigo-300 max-w-xs truncate block"
                        >
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      {userRole !== 'user' && (
                        <td className="px-4 py-3 text-slate-300 max-w-xs truncate">
                          {ticket.profiles?.full_name}
                        </td>
                      )}
                      {userRole !== 'user' && (
                        <td className="px-4 py-3 text-slate-300">
                          {ticket.agent?.full_name || '—'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(ticket.created_at).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/tickets/${ticket.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Mobile card view */}
              <div className="space-y-3 md:hidden">
                {tickets.map((ticket: any) => (
                  <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                    <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-indigo-400 truncate flex-1">
                          {ticket.title}
                        </p>
                        <Badge variant={getPriorityColor(ticket.priority)} className="text-xs">
                          {ticket.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-slate-400">
                          {new Date(ticket.created_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{ticket.profiles?.full_name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
