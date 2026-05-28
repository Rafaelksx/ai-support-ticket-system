import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/metric-card';
import {
  Ticket, LockOpen, AlertTriangle, UserCheck,
  Zap, ClipboardList, PlusCircle, TrendingUp, ChevronRight,
} from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAgent = profile?.role === 'agent' || profile?.role === 'admin';
  const isAdmin  = profile?.role === 'admin';
  const isUser   = profile?.role === 'user';

  // ── Métricas ─────────────────────────────────────────────────────────────
  let totalTickets = 0, openTickets = 0, highPriorityTickets = 0, assignedToMe = 0;

  if (isAgent) {
    const [{ count: total }, { count: open }, { count: high }, { count: mine }] = await Promise.all([
      supabase.from('tickets').select('id', { count: 'exact', head: true }),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).neq('status', 'closed'),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).in('priority', ['high', 'critical']),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('assigned_to', user.id),
    ]);
    totalTickets = total || 0; openTickets = open || 0;
    highPriorityTickets = high || 0; assignedToMe = mine || 0;
  } else {
    const [{ count: total }, { count: open }] = await Promise.all([
      supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
      supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('created_by', user.id).neq('status', 'closed'),
    ]);
    totalTickets = total || 0; openTickets = open || 0;
  }

  // ── Datos ─────────────────────────────────────────────────────────────────
  const { data: urgentTickets } = isAgent
    ? await supabase
        .from('tickets')
        .select('id, title, priority, status, created_at, profiles:created_by(full_name), agent:assigned_to(full_name)')
        .in('priority', ['critical', 'high'])
        .neq('status', 'closed')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(5)
    : { data: [] };

  const { data: myRecentTickets } = isUser
    ? await supabase
        .from('tickets')
        .select('id, title, priority, status, created_at, categories(name)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(8)
    : { data: [] };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getPriorityColor = (p: string) =>
    p === 'critical' ? 'danger' : p === 'high' ? 'warning' : p === 'medium' ? 'info' : 'secondary';

  const getStatusColor = (s: string) =>
    s === 'closed' || s === 'resolved' ? 'success' : s === 'in_progress' ? 'info' : 'secondary';

  const statusLabel: Record<string, string> = {
    open: 'Abierto', in_progress: 'En Progreso', resolved: 'Resuelto', closed: 'Cerrado',
  };

  return (
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Bienvenido a tu panel de control</p>
        </div>
        <div className="flex gap-3">
          {isUser && (
            <Link href="/tickets/new">
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" /> Reportar Incidente
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/metrics">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" /> Ver Métricas
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <MetricCard title="Total de Tickets"      value={totalTickets}         icon={Ticket}       />
        <MetricCard title="Tickets Abiertos"       value={openTickets}          icon={LockOpen}     />
        {isAgent && (
          <>
            <MetricCard title="Prioridad Alta/Crítica" value={highPriorityTickets} icon={AlertTriangle} />
            <MetricCard title="Asignados a Ti"         value={assignedToMe}        icon={UserCheck}    />
          </>
        )}
      </div>

      {/* ── Tickets urgentes — agentes/admin ─────────────────────────────── */}
      {isAgent && urgentTickets && urgentTickets.length > 0 && (
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Tickets Urgentes</span>
              <Badge variant="danger">{urgentTickets.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Desktop */}
            <table className="w-full text-sm hidden md:table">
              <thead className="border-b border-slate-700">
                <tr className="text-slate-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Título</th>
                  <th className="px-4 py-3 text-left">Prioridad</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Usuario</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Asignado a</th>
                  <th className="px-4 py-3 text-left">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {urgentTickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 max-w-xs truncate">
                      <Link href={`/tickets/${t.id}`} className="text-indigo-400 hover:text-indigo-300">{t.title}</Link>
                    </td>
                    <td className="px-4 py-3"><Badge variant={getPriorityColor(t.priority)}>{t.priority}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={getStatusColor(t.status)}>{statusLabel[t.status]}</Badge></td>
                    <td className="px-4 py-3 text-slate-300 hidden lg:table-cell">{t.profiles?.full_name}</td>
                    <td className="px-4 py-3 text-slate-300 hidden lg:table-cell">{t.agent?.full_name || '—'}</td>
                    <td className="px-4 py-3">
                      <Link href={`/tickets/${t.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Ver <ChevronRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {urgentTickets.map((t: any) => (
                <Link key={t.id} href={`/tickets/${t.id}`}>
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-indigo-400 truncate flex-1">{t.title}</p>
                      <Badge variant={getPriorityColor(t.priority)} className="text-xs">{t.priority}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant={getStatusColor(t.status)}>{statusLabel[t.status]}</Badge>
                      <span className="text-slate-400">{t.profiles?.full_name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Mis tickets recientes — usuarios ─────────────────────────────── */}
      {isUser && (
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-400" />
                Mis Tickets Recientes
              </span>
              <Link href="/tickets">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!myRecentTickets || myRecentTickets.length === 0 ? (
              <div className="text-center py-10">
                <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No tienes tickets todavía</p>
                <Link href="/tickets/new">
                  <Button size="sm" className="gap-2">
                    <PlusCircle className="w-4 h-4" /> Reportar mi primer incidente
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {myRecentTickets.map((t: any) => (
                  <Link key={t.id} href={`/tickets/${t.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-800/50 transition-colors group">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        t.status === 'open'        ? 'bg-yellow-400' :
                        t.status === 'in_progress' ? 'bg-blue-400'   :
                        t.status === 'resolved'    ? 'bg-emerald-400' : 'bg-slate-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                          {t.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {t.categories?.name && (
                            <span className="text-xs text-slate-500">{t.categories.name}</span>
                          )}
                          <span className="text-xs text-slate-600">·</span>
                          <span className="text-xs text-slate-500">
                            {new Date(t.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={getPriorityColor(t.priority)} className="text-xs hidden sm:flex">
                          {t.priority}
                        </Badge>
                        <Badge variant={getStatusColor(t.status)} className="text-xs">
                          {statusLabel[t.status] ?? t.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
