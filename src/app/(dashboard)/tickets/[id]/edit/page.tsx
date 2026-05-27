'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const resolved = await params;
      setTicketId(resolved.id);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user is agent
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'agent' && profile?.role !== 'admin') {
        router.push(`/dashboard/tickets/${resolved.id}`);
        return;
      }

      // Fetch ticket
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', resolved.id)
        .single();

      if (ticketData) {
        setTicket(ticketData);
        setStatus(ticketData.status);
        setPriority(ticketData.priority);
        setAssignedTo(ticketData.assigned_to || '');
      }

      // Fetch agents
      const { data: agentsData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['agent', 'admin']);

      setAgents(agentsData || []);
      setIsLoading(false);
    };

    loadData();
  }, [params, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status,
          priority,
          assigned_to: assignedTo || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (updateError) {
        setError(updateError.message);
        setIsSaving(false);
        return;
      }

      router.push(`/dashboard/tickets/${ticketId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p className="text-slate-400">Cargando...</p>;
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Ticket no encontrado</p>
        <Link href="/dashboard/tickets">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Editar Ticket</h1>
        <p className="text-slate-400">{ticket.title}</p>
      </div>

      <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Actualizar Estado</CardTitle>
          <CardDescription className="text-slate-400">
            Cambia el estado, prioridad y asignación del ticket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase block mb-2">
                Estado
              </label>
              <select
                className={`
                  w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
                  border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
                  transition-all duration-200 backdrop-blur-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/40
                `}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="open">Abierto</option>
                <option value="in_progress">En Progreso</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase block mb-2">
                Prioridad
              </label>
              <select
                className={`
                  w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
                  border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
                  transition-all duration-200 backdrop-blur-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/40
                `}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase block mb-2">
                Asignar a
              </label>
              <select
                className={`
                  w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
                  border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
                  transition-all duration-200 backdrop-blur-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/40
                `}
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.full_name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={isSaving} className="flex-1">
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
