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
import { RiskAssessmentRequest, RiskAssessmentResponse } from '@/types/ai';

// Validation schema
const riskSchema = z.object({
  ticketId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative', 'angry']).nullable(),
  time_open_hours: z.number().positive(),
  interaction_count: z.number().nonnegative(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
});

/**
 * POST /api/ai/risk - Assess escalation risk for a ticket
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
    const validation = await validateRequestBody<RiskAssessmentRequest>(request, riskSchema);
    if (!validation.valid) {
      return errorResponse(validation.error || 'Datos inválidos', 'VALIDATION_ERROR', 400);
    }

    const { ticketId, title, description, sentiment, time_open_hours, interaction_count, priority } = validation.data!;

    // Simple rule-based risk assessment (can be enhanced with OpenAI)
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Risk factor: angry sentiment
    if (sentiment === 'angry') {
      riskFactors.push('El cliente está enojado (sentimiento negativo detectado)');
      riskScore += 0.3;
    }

    // Risk factor: critical priority
    if (priority === 'critical') {
      riskFactors.push('Prioridad crítica asignada');
      riskScore += 0.4;
    }

    // Risk factor: ticket open for long time
    if (time_open_hours > 48) {
      riskFactors.push(`El ticket ha estado abierto por ${Math.round(time_open_hours)} horas`);
      riskScore += 0.2;
    }

    // Risk factor: many interactions without resolution
    if (interaction_count > 5) {
      riskFactors.push(`Múltiples interacciones (${interaction_count}) sin resolución`);
      riskScore += 0.15;
    }

    riskScore = Math.min(1, riskScore);

    const riskLevel = riskScore >= 0.7 ? 'high' : riskScore >= 0.4 ? 'medium' : 'low';

    const recommendedAction =
      riskLevel === 'high'
        ? 'escalate'
        : riskLevel === 'medium'
          ? 'prioritize'
          : 'monitor';

    const response: RiskAssessmentResponse = {
      risk_level: riskLevel,
      risk_score: riskScore,
      risk_factors: riskFactors.length > 0 ? riskFactors : ['Sin factores de riesgo significativos'],
      recommended_action: recommendedAction,
      reasoning: `Puntuación de riesgo: ${(riskScore * 100).toFixed(1)}%. ${riskFactors.join(' ')}`,
    };

    // Log AI call
    const supabase = await createClient();
    await supabase.from('ai_logs').insert([
      {
        ticket_id: ticketId,
        prompt: JSON.stringify(validation.data),
        model_version: 'risk-assessment-v1',
        response: response,
        latency_ms: 50,
        token_count: 0,
      },
    ]);

    return successResponse(response);
  } catch (error) {
    console.error('[v0] POST /api/ai/risk error:', error);
    return errorResponse('Error en evaluación de riesgo', 'AI_ERROR', 500);
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
