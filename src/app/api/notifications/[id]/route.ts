import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthUser,
  errorResponse,
  successResponse,
  methodNotAllowed,
  logAPICall,
} from '@/lib/api-helpers';

/**
 * PATCH /api/notifications/[id] - Mark notification as read
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const startTime = Date.now();

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    const supabase = await createClient();
    const notificationId = params.id;

    // Verify notification belongs to user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .single();

    if (fetchError || !notification) {
      return errorResponse('Notificación no encontrada', 'NOT_FOUND', 404);
    }

    if (notification.user_id !== user.id) {
      return errorResponse('No autorizado', 'FORBIDDEN', 403);
    }

    // Mark as read
    const { data: updated, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      console.error('[v0] Error updating notification:', error);
      return errorResponse('Error al actualizar notificación', 'DATABASE_ERROR', 500);
    }

    await logAPICall(`/api/notifications/${notificationId}`, 'PATCH', user.id, 200, Date.now() - startTime);

    return successResponse(updated);
  } catch (error) {
    console.error('[v0] PATCH /api/notifications/[id] error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * Handle unsupported methods
 */
export async function handler(request: NextRequest) {
  if (request.method !== 'PATCH') {
    return methodNotAllowed(['PATCH']);
  }
  return PATCH(request, { params: { id: '' } });
}
