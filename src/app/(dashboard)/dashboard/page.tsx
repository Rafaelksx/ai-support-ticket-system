import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/metric-card';
import {
  Ticket, LockOpen, AlertTriangle, UserCheck,
  Zap, ClipboardList, PlusCircle, TrendingUp, ChevronRight, Sparkles,
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
      <div className="flex flex-wrap gap-4 justify-between items-start animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Panel de Control</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text leading-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Bienvenido a tu centro de operaciones</p>
        </div>
        <div className="flex gap-3 animate-fade-up delay-100">
          {isUser && (
            <Link href="/tickets/new">
              <Button variant="gradient" className="gap-2 shadow-lg">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          title="Total de Tickets"
          value={totalTickets}
          icon={Ticket}
          color="default"
          staggerIndex={0}
        />
        <MetricCard
          title="Tickets Abiertos"
          value={openTickets}
          icon={LockOpen}
          color="warning"
          staggerIndex={1}
        />
        {isAgent && (
          <>
            <MetricCard
              title="Alta Prioridad"
              value={highPriorityTickets}
              icon={AlertTriangle}
              color="danger"
              staggerIndex={2}
            />
            <MetricCard
              title="Asignados a Ti"
              value={assignedToMe}
              icon={UserCheck}
              color="success"
              staggerIndex={3}
            />
          </>
        )}
      </div>

      {/* ── Tickets urgentes — agentes/admin ─────────────────────────────── */}
      {isAgent && urgentTickets && urgentTickets.length > 0 && (
        <div className="animate-fade-up delay-200">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <span>Tickets Urgentes</span>
                <Badge variant="danger" dot>{urgentTickets.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop */}
              <table className="w-full text-sm hidden md:table">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-medium">Título</th>
                    <th className="px-5 py-3 text-left font-medium">Prioridad</th>
                    <th className="px-5 py-3 text-left font-medium">Estado</th>
                    <th className="px-5 py-3 text-left font-medium hidden lg:table-cell">Usuario</th>
                    <th className="px-5 py-3 text-left font-medium hidden lg:table-cell">Asignado</th>
                    <th className="px-5 py-3 text-left font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {urgentTickets.map((t: any) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-white/[0.03] transition-colors group ${
                        t.priority === 'critical' ? 'pulse-critical' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5 max-w-xs">
                        <Link href={`/tickets/${t.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium truncate block">
                          {t.priority === 'critical' && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-2 align-middle" />
                          )}
                          {t.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={getPriorityColor(t.priority) as any} dot>{t.priority}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={getStatusColor(t.status) as any}>{statusLabel[t.status]}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 hidden lg:table-cell text-sm">{t.profiles?.full_name}</td>
                      <td className="px-5 py-3.5 text-slate-400 hidden lg:table-cell text-sm">{t.agent?.full_name || '—'}</td>
                      <td className="px-5 py-3.5">
                        <Link href={`/tickets/${t.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 group-hover:text-indigo-300 text-xs">
                            Ver <ChevronRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile */}
              <div className="space-y-2 p-4 md:hidden">
                {urgentTickets.map((t: any) => (
                  <Link key={t.id} href={`/tickets/${t.id}`}>
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-indigo-500/20 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-indigo-400 truncate flex-1">{t.title}</p>
                        <Badge variant={getPriorityColor(t.priority) as any}>{t.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant={getStatusColor(t.status) as any}>{statusLabel[t.status]}</Badge>
                        <span className="text-slate-500">{t.profiles?.full_name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Mis tickets recientes — usuarios ─────────────────────────────── */}
      {isUser && (
        <div className="animate-fade-up delay-200">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <ClipboardList className="w-4 h-4 text-indigo-400" />
                  </div>
                  Mis Tickets Recientes
                </span>
                <Link href="/tickets">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-slate-400 hover:text-indigo-300">
                    Ver todos <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!myRecentTickets || myRecentTickets.length === 0 ? (
                <div className="text-center py-14">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-4">
                    <Ticket className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 mb-5 font-medium">No tienes tickets todavía</p>
                  <Link href="/tickets/new">
                    <Button variant="gradient" size="sm" className="gap-2">
                      <PlusCircle className="w-4 h-4" /> Reportar mi primer incidente
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {myRecentTickets.map((t: any, i: number) => (
                    <Link key={t.id} href={`/tickets/${t.id}`}>
                      <div
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.05] bg-slate-900/40 hover:bg-slate-800/50 hover:border-indigo-500/20 transition-all duration-200 group animate-fade-up"
                        style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                      >
                        {/* Status dot */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          t.status === 'open'        ? 'bg-amber-400 animate-pulse' :
                          t.status === 'in_progress' ? 'bg-sky-400'                :
                          t.status === 'resolved'    ? 'bg-emerald-400'             : 'bg-slate-600'
                        }`} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                            {t.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {t.categories?.name && (
                              <span className="text-xs text-slate-500">{t.categories.name}</span>
                            )}
                            <span className="text-xs text-slate-700">·</span>
                            <span className="text-xs text-slate-500">
                              {new Date(t.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={getPriorityColor(t.priority) as any} className="hidden sm:flex">
                            {t.priority}
                          </Badge>
                          <Badge variant={getStatusColor(t.status) as any}>
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
        </div>
      )}

    </div>
  );
}
