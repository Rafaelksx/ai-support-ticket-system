import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthUser,
  validateRequestBody,
  errorResponse,
  successResponse,
  methodNotAllowed,
  logAPICall,
  getPaginationParams,
} from '@/lib/api-helpers';

// Validation schema for creating comments
const createCommentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío').max(5000),
  is_ai_generated: z.boolean().optional().default(false),
});

/**
 * GET /api/tickets/[id]/comments - List comments for a ticket
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
    const { skip, take } = getPaginationParams(request);

    // Get comments with author info
    const { data: comments, error, count } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:author_id (id, full_name, email, role)
      `,
        { count: 'exact' }
      )
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
      .range(skip, skip + take - 1);

    if (error) {
      console.error('[v0] Error fetching comments:', error);
      return errorResponse('Error al obtener comentarios', 'DATABASE_ERROR', 500);
    }

    await logAPICall(`/api/tickets/${ticketId}/comments`, 'GET', user.id, 200, Date.now() - startTime);

    return successResponse({
      data: comments,
      count,
    });
  } catch (error) {
    console.error('[v0] GET /api/tickets/[id]/comments error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * POST /api/tickets/[id]/comments - Add a comment to a ticket
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  const startTime = Date.now();

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    // Validate request body
    const validation = await validateRequestBody(request, createCommentSchema);
    if (!validation.valid) {
      return errorResponse(validation.error || 'Datos inválidos', 'VALIDATION_ERROR', 400);
    }

    const { content, is_ai_generated } = validation.data as any;
    const ticketId = id;

    const supabase = await createClient();

    // Verify ticket exists and user has access
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, created_by')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return errorResponse('Ticket no encontrado', 'NOT_FOUND', 404);
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([
        {
          ticket_id: ticketId,
          author_id: user.id,
          content,
          is_ai_generated: is_ai_generated || false,
        },
      ])
      .select(
        `
        *,
        author:author_id (id, full_name, email, role)
      `
      )
      .single();

    if (error) {
      console.error('[v0] Error creating comment:', error);
      return errorResponse('Error al crear comentario', 'DATABASE_ERROR', 500);
    }

    await logAPICall(
      `/api/tickets/${ticketId}/comments`,
      'POST',
      user.id,
      201,
      Date.now() - startTime,
      { comment_id: comment.id }
    );

    // Create notification for ticket creator if commenter is agent
    const userProfile = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if ((userProfile.data?.role === 'agent' || userProfile.data?.role === 'admin') && ticket.created_by !== user.id) {
      await supabase.from('notifications').insert([
        {
          user_id: ticket.created_by,
          ticket_id: ticketId,
          title: 'Nuevo comentario en tu ticket',
          message: `${userProfile.data?.role === 'agent' ? 'Un agente' : 'Un administrador'} ha respondido a tu ticket`,
        },
      ]);
    }

    return successResponse(comment, 201);
  } catch (error) {
    console.error('[v0] POST /api/tickets/[id]/comments error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}


