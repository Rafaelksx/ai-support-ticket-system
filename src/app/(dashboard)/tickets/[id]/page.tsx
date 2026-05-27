import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommentSection } from '@/components/comment-section';
import { AIAssistant } from '@/components/ai-assistant';

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ticketId } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get ticket details
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select(
      `
      *,
      categories(name),
      created_by_profile:created_by(full_name, email),
      assigned_profile:assigned_to(full_name, email)
    `
    )
    .eq('id', ticketId)
    .single();

  if (ticketError || !ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">Ticket no encontrado</p>
        <Link href="/dashboard/tickets">
          <Button variant="outline">Volver a Tickets</Button>
        </Link>
      </div>
    );
  }

  // Get user profile for role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Check permissions
  const isOwner = ticket.created_by === user.id;
  const isAgent = profile?.role === 'agent' || profile?.role === 'admin';

  if (!isOwner && !isAgent) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 mb-4">No tienes permiso para ver este ticket</p>
        <Link href="/dashboard">
          <Button variant="outline">Volver al Dashboard</Button>
        </Link>
      </div>
    );
  }

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{ticket.title}</h1>
          <p className="text-slate-400">
            Creado por {ticket.created_by_profile?.full_name} el{' '}
            {new Date(ticket.created_at).toLocaleString('es-MX', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </p>
        </div>
        {isAgent && (
          <Link href={`/dashboard/tickets/${ticketId}/edit`}>
            <Button>Editar</Button>
          </Link>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Ticket Info Card */}
          <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Información del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Estado</p>
                  <Badge variant={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Prioridad</p>
                  <Badge variant={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
                {ticket.sentiment && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Sentimiento</p>
                    <Badge variant="info">{ticket.sentiment}</Badge>
                  </div>
                )}
                {ticket.categories?.name && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Categoría</p>
                    <Badge variant="secondary">{ticket.categories.name}</Badge>
                  </div>
                )}
              </div>

              {ticket.assigned_profile && (
                <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Asignado a</p>
                  <p className="text-sm text-slate-300">{ticket.assigned_profile.full_name}</p>
                </div>
              )}

              {ticket.resolved_at && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Resuelto el</p>
                  <p className="text-sm text-emerald-400">
                    {new Date(ticket.resolved_at).toLocaleString('es-MX', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description Card */}
          <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentSection
            ticketId={ticketId}
            userRole={profile?.role || 'user'}
            userId={user.id}
          />
        </div>

        {/* Right Column - AI Assistant (for agents only) */}
        {isAgent && (
          <div>
            <AIAssistant
              ticketId={ticketId}
              aiSummary={ticket.ai_summary}
              aiSuggestedResponse={ticket.ai_suggested_response}
              aiClassification={ticket.ai_classification}
            />
          </div>
        )}
      </div>
    </div>
  );
}
