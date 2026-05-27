import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthUser,
  errorResponse,
  successResponse,
  methodNotAllowed,
  getPaginationParams,
  logAPICall,
} from '@/lib/api-helpers';

/**
 * GET /api/notifications - Get notifications for current user
 * Query params: page, limit, unread_only
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    const supabase = await createClient();
    const { skip, take } = getPaginationParams(request);

    const unreadOnly = new URL(request.url).searchParams.get('unread_only') === 'true';

    // Get notifications
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error, count } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) {
      console.error('[v0] Error fetching notifications:', error);
      return errorResponse('Error al obtener notificaciones', 'DATABASE_ERROR', 500);
    }

    await logAPICall('/api/notifications', 'GET', user.id, 200, Date.now() - startTime, {
      count,
    });

    return successResponse({
      data: notifications,
      unread_count: unreadOnly ? notifications?.length : undefined,
      count,
    });
  } catch (error) {
    console.error('[v0] GET /api/notifications error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * Handle unsupported methods
 */
export async function handler(request: NextRequest) {
  if (request.method !== 'GET') {
    return methodNotAllowed(['GET']);
  }
  return GET(request);
}
