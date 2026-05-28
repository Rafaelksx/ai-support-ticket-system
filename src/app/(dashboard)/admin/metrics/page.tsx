import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/metric-card';
import {
  CheckCircle2, AlertCircle, AlertTriangle,
  Users, Tag, Clock, ArrowLeft, ChevronRight, BarChart3,
  TrendingUp, Target,
} from 'lucide-react';

export default async function MetricsPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'admin') redirect('/dashboard');

  // ── Queries en paralelo ───────────────────────────────────────────────────
  const [
    { count: total },
    { count: open },
    { count: inProgress },
    { count: resolved },
    { count: closed },
    { count: critical },
    { count: high },
    { count: medium },
    { count: low },
    { data: recentTickets },
    { data: agentWorkload },
    { data: categoryBreakdown },
  ] = await Promise.all([
    supabase.from('tickets').select('id', { count: 'exact', head: true }),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'closed'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('priority', 'critical'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('priority', 'high'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('priority', 'medium'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('priority', 'low'),
    supabase.from('tickets')
      .select('id, title, priority, status, created_at, profiles:created_by(full_name), agent:assigned_to(full_name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('tickets')
      .select('assigned_to, agent:assigned_to(full_name), status')
      .not('assigned_to', 'is', null)
      .neq('status', 'closed'),
    supabase.from('tickets')
      .select('category_id, categories(name)')
      .not('category_id', 'is', null),
  ]);

  const totalN      = total || 0;
  const resolvedN   = (resolved || 0) + (closed || 0);
  const resolutionRate = totalN > 0 ? Math.round((resolvedN / totalN) * 100) : 0;

  // Carga por agente
  const agentMap: Record<string, { name: string; count: number }> = {};
  (agentWorkload || []).forEach((t: any) => {
    if (!t.assigned_to) return;
    if (!agentMap[t.assigned_to]) agentMap[t.assigned_to] = { name: t.agent?.full_name || 'Sin nombre', count: 0 };
    agentMap[t.assigned_to].count++;
  });
  const agentList = Object.values(agentMap).sort((a, b) => b.count - a.count);

  // Por categoría
  const catMap: Record<string, { name: string; count: number }> = {};
  (categoryBreakdown || []).forEach((t: any) => {
    const key = t.category_id;
    const name = t.categories?.name || 'Sin categoría';
    if (!catMap[key]) catMap[key] = { name, count: 0 };
    catMap[key].count++;
  });
  const catList = Object.values(catMap).sort((a, b) => b.count - a.count).slice(0, 6);
  const maxCat = catList[0]?.count || 1;

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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-400" />
            Métricas &amp; Performance
          </h1>
          <p className="text-slate-400 mt-1">Visión general del sistema de soporte — solo Admin</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
        </Link>
      </div>

      {/* ── KPIs principales ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Total Tickets"       value={totalN}           iconName="ticket"          />
        <MetricCard title="Tasa de Resolución"  value={`${resolutionRate}%`} iconName="trending-up" />
        <MetricCard title="Críticos Activos"    value={critical || 0}    iconName="alert-circle"    />
        <MetricCard title="Alta Prioridad"      value={high || 0}        iconName="alert-triangle"  />
      </div>

      {/* ── Distribución por estado y prioridad ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Por estado */}
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Tickets por Estado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Abiertos',    count: open || 0,       color: 'bg-yellow-400', dot: 'bg-yellow-400' },
              { label: 'En Progreso', count: inProgress || 0, color: 'bg-blue-400',   dot: 'bg-blue-400'   },
              { label: 'Resueltos',   count: resolved || 0,   color: 'bg-emerald-400',dot: 'bg-emerald-400'},
              { label: 'Cerrados',    count: closed || 0,     color: 'bg-slate-500',  dot: 'bg-slate-500'  },
            ].map(({ label, count, color, dot }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    {label}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">
                    {count} <span className="text-slate-600">({totalN > 0 ? Math.round((count/totalN)*100) : 0}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div
                    className={`${color} h-1.5 rounded-full transition-all duration-700`}
                    style={{ width: `${totalN > 0 ? Math.round((count/totalN)*100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Por prioridad */}
        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> Tickets por Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Crítica', count: critical || 0, color: 'bg-red-500',    dot: 'bg-red-500'    },
              { label: 'Alta',    count: high || 0,     color: 'bg-orange-400', dot: 'bg-orange-400' },
              { label: 'Media',   count: medium || 0,   color: 'bg-blue-400',   dot: 'bg-blue-400'   },
              { label: 'Baja',    count: low || 0,      color: 'bg-green-400',  dot: 'bg-green-400'  },
            ].map(({ label, count, color, dot }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    {label}
                  </span>
                  <span className="text-slate-400 font-mono text-xs">
                    {count} <span className="text-slate-600">({totalN > 0 ? Math.round((count/totalN)*100) : 0}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                  <div
                    className={`${color} h-1.5 rounded-full transition-all duration-700`}
                    style={{ width: `${totalN > 0 ? Math.round((count/totalN)*100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Carga por agente + Categorías ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Carga por Agente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentList.length === 0 ? (
              <p className="text-slate-500 text-sm">No hay tickets asignados actualmente</p>
            ) : (
              <div className="space-y-4">
                {agentList.map((agent, i) => {
                  const pct = Math.round((agent.count / (agentList[0]?.count || 1)) * 100);
                  const color = i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-violet-500' : 'bg-slate-500';
                  return (
                    <div key={agent.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-slate-300 truncate max-w-[160px]">{agent.name}</span>
                        <span className="text-slate-400 text-xs font-mono">{agent.count} ticket{agent.count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-400" /> Tickets por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            {catList.length === 0 ? (
              <p className="text-slate-500 text-sm">Sin categorías asignadas</p>
            ) : (
              <div className="space-y-4">
                {catList.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300 truncate max-w-[180px]">{cat.name}</span>
                      <span className="text-slate-400 text-xs font-mono">{cat.count}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                      <div
                        className="bg-cyan-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.round((cat.count / maxCat) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Actividad reciente ────────────────────────────────────────────── */}
      <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" /> Últimos 10 Tickets
            </span>
            <Link href="/tickets">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Ver todos <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm hidden md:table">
            <thead className="border-b border-slate-700">
              <tr className="text-slate-400 text-xs uppercase">
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Prioridad</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-left">Agente</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {(recentTickets || []).map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 max-w-[220px] truncate">
                    <Link href={`/tickets/${t.id}`} className="text-indigo-400 hover:text-indigo-300">{t.title}</Link>
                  </td>
                  <td className="px-4 py-3"><Badge variant={getPriorityColor(t.priority)}>{t.priority}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={getStatusColor(t.status)}>{statusLabel[t.status]}</Badge></td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{t.profiles?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{t.agent?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(t.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile */}
          <div className="space-y-2 md:hidden">
            {(recentTickets || []).map((t: any) => (
              <Link key={t.id} href={`/tickets/${t.id}`}>
                <div className="p-3 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-indigo-400 truncate">{t.title}</p>
                    <Badge variant={getPriorityColor(t.priority)} className="text-xs">{t.priority}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(t.status)} className="text-xs">{statusLabel[t.status]}</Badge>
                    <span className="text-xs text-slate-500">{t.profiles?.full_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
