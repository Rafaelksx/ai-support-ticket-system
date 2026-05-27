import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-helpers';

/**
 * POST /api/webhooks/n8n - Receive webhooks from n8n workflows
 * This endpoint is used by n8n to respond to events like ticket created, priority changed, etc.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-webhook-secret');
    if (secret !== process.env.N8N_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
      return errorResponse('Webhook signature inválida', 'UNAUTHORIZED', 401);
    }

    const body = await request.json();

    console.log('[v0] Received n8n webhook:', {
      event: body.event,
      timestamp: new Date().toISOString(),
      payload: body,
    });

    // Process webhook based on event type
    switch (body.event) {
      case 'ticket_created':
        // Email confirmation already sent by n8n
        console.log('[v0] Ticket created event processed');
        break;

      case 'ticket_priority_high':
        // Slack alert already sent by n8n
        console.log('[v0] High priority alert processed');
        break;

      case 'ticket_resolved':
        // Closure email already sent by n8n
        console.log('[v0] Ticket resolved event processed');
        break;

      case 'daily_summary':
        // Summary report already sent by n8n
        console.log('[v0] Daily summary processed');
        break;

      default:
        console.warn('[v0] Unknown webhook event:', body.event);
    }

    return successResponse(
      {
        acknowledged: true,
        event: body.event,
      },
      200
    );
  } catch (error) {
    console.error('[v0] Webhook processing error:', error);
    return errorResponse('Error procesando webhook', 'WEBHOOK_ERROR', 500);
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
