import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthUser,
  validateRequestBody,
  errorResponse,
  successResponse,
  checkUserRole,
} from '@/lib/api-helpers';
import { NextActionRequest, NextActionResponse } from '@/types/ai';

// Validation schema
const nextActionSchema = z.object({
  ticketId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  current_status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'angry']).nullable(),
  interaction_count: z.number().nonnegative(),
  last_comment_from: z.enum(['user', 'agent']).optional(),
});

/**
 * POST /api/ai/next-action - Recommend next action for a ticket
 * Only accessible to agents and admins
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    // Check agent/admin permission
    const isAgent = await checkUserRole(user.id, ['agent', 'admin']);
    if (!isAgent) {
      return errorResponse('Solo agentes pueden acceder a IA', 'FORBIDDEN', 403);
    }

    // Validate request
    const validation = await validateRequestBody<NextActionRequest>(request, nextActionSchema);
    if (!validation.valid) {
      return errorResponse(validation.error || 'Datos inválidos', 'VALIDATION_ERROR', 400);
    }

    const {
      ticketId,
      title,
      description,
      current_status,
      priority,
      sentiment,
      interaction_count,
      last_comment_from,
    } = validation.data!;

    // Rule-based recommendation engine
    let recommendedAction: 'assign_to_specialist' | 'request_more_info' | 'escalate' | 'close' | 'send_update' | 'provide_workaround';
    let reasoning = '';
    let estimatedImpact = '';

    // Logic for recommendations
    if (current_status === 'resolved') {
      recommendedAction = 'close';
      reasoning = 'El ticket está resuelto y puede ser cerrado.';
      estimatedImpact = 'Limpia la cola de trabajo activo.';
    } else if (priority === 'critical' && sentiment === 'angry') {
      recommendedAction = 'escalate';
      reasoning = 'El cliente está enojado y es un problema crítico. Necesita atención inmediata de un especialista.';
      estimatedImpact = 'Reduce el riesgo de pérdida del cliente.';
    } else if (priority === 'critical') {
      recommendedAction = 'assign_to_specialist';
      reasoning = 'Es un problema crítico que requiere especialización.';
      estimatedImpact = 'Resolución más rápida con expertise adecuado.';
    } else if (interaction_count === 0) {
      recommendedAction = 'send_update';
      reasoning = 'No hay interacción aún. Se debe enviar una actualización inicial.';
      estimatedImpact = 'Mejora la comunicación con el cliente.';
    } else if (last_comment_from === 'user' && interaction_count > 2) {
      recommendedAction = 'request_more_info';
      reasoning = 'El usuario ha comentado últimamente pero necesita clarificación adicional.';
      estimatedImpact = 'Recopila información esencial para la resolución.';
    } else if (sentiment === 'neutral' && interaction_count > 3) {
      recommendedAction = 'provide_workaround';
      reasoning = 'Después de varias interacciones sin resolver, un workaround temporal puede ayudar.';
      estimatedImpact = 'Mantiene al usuario productivo mientras se desarrolla la solución.';
    } else {
      recommendedAction = 'send_update';
      reasoning = 'Envía una actualización de progreso al cliente.';
      estimatedImpact = 'Mantiene la comunicación abierta y la confianza del cliente.';
    }

    const response: NextActionResponse = {
      recommended_action: recommendedAction,
      reasoning,
      estimated_impact: estimatedImpact,
    };

    // Log AI call
    const supabase = await createClient();
    await supabase.from('ai_logs').insert([
      {
        ticket_id: ticketId,
        prompt: JSON.stringify(validation.data),
        model_version: 'next-action-v1',
        response: response,
        latency_ms: 50,
        token_count: 0,
      },
    ]);

    return successResponse(response);
  } catch (error) {
    console.error('[v0] POST /api/ai/next-action error:', error);
    return errorResponse('Error en recomendación de acción', 'AI_ERROR', 500);
  }
}

/**
 * Handle unsupported methods
 */
export async function handler(request: NextRequest) {
  if (request.method !== 'POST') {
    return errorResponse('Solo POST está permitido', 'METHOD_NOT_ALLOWED', 405);
  }
  return POST(request);
}
