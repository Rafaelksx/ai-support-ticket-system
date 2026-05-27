import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthUser,
  validateRequestBody,
  errorResponse,
  successResponse,
  methodNotAllowed,
  checkUserRole,
  logAPICall,
} from '@/lib/api-helpers';
import { UpdateTicketRequest } from '@/types/database';

// Validation schema for updating tickets
const updateTicketSchema = z.object({
  title: z.string().min(5).max(255).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
});

/**
 * GET /api/tickets/[id] - Get ticket details with comments and relations
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  const startTime = Date.now();

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    const supabase = await createClient();
    const ticketId = id;

    // Get ticket with relations
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(
        `
        *,
        profiles:created_by (id, full_name, email, role),
        agent:assigned_to (id, full_name, email),
        category:category_id (id, name),
        comments (
          *,
          author:author_id (id, full_name, email, role)
        )
      `
      )
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      return errorResponse('Ticket no encontrado', 'NOT_FOUND', 404);
    }

    // Check if user has access (RLS should handle this, but extra validation)
    const userProfile = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isOwner = ticket.created_by === user.id;
    const isAgent = userProfile.data?.role === 'agent' || userProfile.data?.role === 'admin';

    if (!isOwner && !isAgent) {
      return errorResponse('No autorizado', 'FORBIDDEN', 403);
    }

    await logAPICall(`/api/tickets/${ticketId}`, 'GET', user.id, 200, Date.now() - startTime);

    return successResponse(ticket);
  } catch (error) {
    console.error('[v0] GET /api/tickets/[id] error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * PATCH /api/tickets/[id] - Update ticket (agent/admin only for most fields)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  const startTime = Date.now();

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    // Validate permissions
    const isAgent = await checkUserRole(user.id, ['agent', 'admin']);
    if (!isAgent) {
      return errorResponse('Solo agentes pueden actualizar tickets', 'FORBIDDEN', 403);
    }

    // Validate request body
    const validation = await validateRequestBody<UpdateTicketRequest>(request, updateTicketSchema);
    if (!validation.valid) {
      return errorResponse(validation.error || 'Datos inválidos', 'VALIDATION_ERROR', 400);
    }

    const supabase = await createClient();
    const ticketId = id;

    // Build update object (only non-undefined fields)
    const updateData = Object.fromEntries(
      Object.entries(validation.data || {}).filter(([_, v]) => v !== undefined)
    );

    // Add resolved_at if status changes to resolved
    if (updateData.status === 'resolved' && !updateData.resolved_at) {
      updateData.resolved_at = new Date().toISOString();
    }

    // Update ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      console.error('[v0] Error updating ticket:', error);
      return errorResponse('Error al actualizar el ticket', 'DATABASE_ERROR', 500);
    }

    await logAPICall(`/api/tickets/${ticketId}`, 'PATCH', user.id, 200, Date.now() - startTime);

    // Trigger webhook if priority changed to high/critical
    if (updateData.priority && ['high', 'critical'].includes(updateData.priority)) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/n8n`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ticket_priority_high',
          ticket_id: ticketId,
          priority: updateData.priority,
        }),
      }).catch((err) => console.error('[v0] Webhook trigger failed:', err));
    }

    return successResponse(ticket);
  } catch (error) {
    console.error('[v0] PATCH /api/tickets/[id] error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * DELETE /api/tickets/[id] - Delete ticket (admin only)
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  const startTime = Date.now();

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    // Check if user is admin
    const isAdmin = await checkUserRole(user.id, ['admin']);
    if (!isAdmin) {
      return errorResponse('Solo administradores pueden eliminar tickets', 'FORBIDDEN', 403);
    }

    const supabase = await createClient();
    const ticketId = id;

    // Delete ticket (comments will be deleted via CASCADE)
    const { error } = await supabase.from('tickets').delete().eq('id', ticketId);

    if (error) {
      console.error('[v0] Error deleting ticket:', error);
      return errorResponse('Error al eliminar el ticket', 'DATABASE_ERROR', 500);
    }

    await logAPICall(`/api/tickets/${ticketId}`, 'DELETE', user.id, 200, Date.now() - startTime);

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('[v0] DELETE /api/tickets/[id] error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * Handle unsupported methods
 */
