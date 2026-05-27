import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthUser,
  validateRequestBody,
  errorResponse,
  successResponse,
  methodNotAllowed,
  getPaginationParams,
  buildTicketFilters,
  checkRateLimit,
  logAPICall,
} from '@/lib/api-helpers';
import { CreateTicketRequest } from '@/types/database';

// Validation schema for creating tickets
const createTicketSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(255),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category_id: z.string().uuid().optional(),
});

/**
 * GET /api/tickets - List tickets with pagination and filtering
 * Query params: page, limit, status, priority, assigned_to, category_id, search
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`tickets-list-${clientIp}`, 100, 60000)) {
      return errorResponse('Demasiadas solicitudes', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    const supabase = await createClient();

    // Get pagination params
    const { skip, take, page, limit } = getPaginationParams(request);

    // Base query - respects RLS from Supabase
    let query = supabase
      .from('tickets')
      .select(
        `
        *,
        profiles:created_by (id, full_name, email, role),
        agent:assigned_to (id, full_name, email),
        category:category_id (id, name),
        comments (id)
      `,
        { count: 'exact' }
      );

    // Apply filters
    query = buildTicketFilters(request, query);

    // Apply sorting
    const sortBy = new URL(request.url).searchParams.get('sort') || 'created_at';
    const sortOrder = new URL(request.url).searchParams.get('order') === 'asc' ? false : true;
    query = query.order(sortBy, { ascending: !sortOrder });

    // Apply pagination
    query = query.range(skip, skip + take - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('[v0] Database error:', error);
      return errorResponse('Error al obtener tickets', 'DATABASE_ERROR', 500);
    }

    // Transform data to include comment count
    const tickets = (data || []).map((ticket) => ({
      ...ticket,
      comment_count: ticket.comments?.length || 0,
    }));

    await logAPICall('/api/tickets', 'GET', user.id, 200, Date.now() - startTime, {
      count,
      limit,
    });

    return successResponse(
      {
        data: tickets,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
      200
    );
  } catch (error) {
    console.error('[v0] GET /api/tickets error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * POST /api/tickets - Create a new ticket
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    // Validate request body
    const validation = await validateRequestBody<CreateTicketRequest>(request, createTicketSchema);
    if (!validation.valid) {
      return errorResponse(validation.error || 'Datos inválidos', 'VALIDATION_ERROR', 400);
    }

    const { title, description, category_id } = validation.data!;

    const supabase = await createClient();

    // Create ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([
        {
          title,
          description,
          category_id: category_id || null,
          created_by: user.id,
          status: 'open',
          priority: 'medium',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[v0] Error creating ticket:', error);
      return errorResponse('Error al crear el ticket', 'DATABASE_ERROR', 500);
    }

    await logAPICall('/api/tickets', 'POST', user.id, 201, Date.now() - startTime, {
      ticket_id: ticket.id,
    });

    // Trigger AI classification asynchronously (don't wait)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticketId: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: category_id || '',
      }),
    }).catch((err) => console.error('[v0] Async AI classify failed:', err));

    return successResponse(ticket, 201, { created: true });
  } catch (error) {
    console.error('[v0] POST /api/tickets error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * Handle unsupported methods
 */
export async function handler(request: NextRequest) {
  if (request.method !== 'GET' && request.method !== 'POST') {
    return methodNotAllowed(['GET', 'POST']);
  }
  return request.method === 'GET' ? GET(request) : POST(request);
}
