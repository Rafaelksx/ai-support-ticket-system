import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/metric-card';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAgent = profile?.role === 'agent' || profile?.role === 'admin';
  const isUser = profile?.role === 'user';

  // Get metrics
  let totalTickets = 0;
  let openTickets = 0;
  let highPriorityTickets = 0;
  let assignedToMe = 0;

  if (isAgent) {
    // Agent metrics
    const { count: total } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true });

    const { count: open } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'closed');

    const { count: highPriority } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .in('priority', ['high', 'critical']);

    const { count: assigned } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_to', user.id);

    totalTickets = total || 0;
    openTickets = open || 0;
    highPriorityTickets = highPriority || 0;
    assignedToMe = assigned || 0;
  } else {
    // User metrics - only their tickets
    const { count: total } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id);

    const { count: open } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .neq('status', 'closed');

    totalTickets = total || 0;
    openTickets = open || 0;
  }

  // Get urgent tickets to display
  const { data: urgentTickets } = await supabase
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
    )
    .in('priority', ['critical', 'high'])
    .neq('status', 'closed')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(5);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Bienvenido a tu panel de control</p>
        </div>
        {isUser && (
          <Link href="/dashboard/tickets/new">
            <Button>Reportar Incidente</Button>
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <MetricCard title="Total de Tickets" value={totalTickets} icon="🎫" />
        <MetricCard title="Tickets Abiertos" value={openTickets} icon="🔓" />
        {isAgent && (
          <>
            <MetricCard title="Prioridad Alta" value={highPriorityTickets} icon="⚠️" />
            <MetricCard title="Asignados a Ti" value={assignedToMe} icon="👤" />
          </>
        )}
      </div>

      {/* Urgent Tickets Section */}
      {isAgent && urgentTickets && urgentTickets.length > 0 && (
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⚡ Tickets Urgentes</span>
              <Badge variant="danger">{urgentTickets.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:overflow-x-auto">
              <table className="w-full text-xs md:text-sm hidden md:table">
                <thead className="border-b border-slate-700">
                  <tr className="text-slate-400">
                    <th className="px-2 md:px-4 py-3 text-left">Título</th>
                    <th className="px-2 md:px-4 py-3 text-left">Prioridad</th>
                    <th className="px-2 md:px-4 py-3 text-left">Estado</th>
                    <th className="px-2 md:px-4 py-3 text-left hidden lg:table-cell">Usuario</th>
                    <th className="px-2 md:px-4 py-3 text-left hidden lg:table-cell">Asignado a</th>
                    <th className="px-2 md:px-4 py-3 text-left">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {urgentTickets.map((ticket: any) => (
                    <tr key={ticket.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-2 md:px-4 py-3 text-slate-300 max-w-xs truncate">
                        <Link
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-2 md:px-4 py-3">
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-2 md:px-4 py-3">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-2 md:px-4 py-3 text-slate-300 hidden lg:table-cell">
                        {ticket.profiles?.full_name}
                      </td>
                      <td className="px-2 md:px-4 py-3 text-slate-300 hidden lg:table-cell">
                        {ticket.agent?.full_name || '—'}
                      </td>
                      <td className="px-2 md:px-4 py-3">
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
                {urgentTickets.map((ticket: any) => (
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
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <span>{ticket.profiles?.full_name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User's Recent Tickets */}
      {isUser && (
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle>Mis Tickets Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Will be populated by client-side fetch */}
            <p className="text-slate-400">Cargando tus tickets...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
