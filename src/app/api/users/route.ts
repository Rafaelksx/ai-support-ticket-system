import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthUser,
  checkUserRole,
  errorResponse,
  successResponse,
  methodNotAllowed,
  getPaginationParams,
  logAPICall,
} from '@/lib/api-helpers';

/**
 * GET /api/users - List all users (admin only)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    // Check admin permission
    const isAdmin = await checkUserRole(user.id, ['admin']);
    if (!isAdmin) {
      return errorResponse('Solo administradores pueden ver usuarios', 'FORBIDDEN', 403);
    }

    const supabase = await createClient();
    const { skip, take } = getPaginationParams(request);

    // Get all users with their profile info
    const { data: users, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) {
      console.error('[v0] Error fetching users:', error);
      return errorResponse('Error al obtener usuarios', 'DATABASE_ERROR', 500);
    }

    await logAPICall('/api/users', 'GET', user.id, 200, Date.now() - startTime, { count });

    return successResponse({
      data: users,
      pagination: {
        total: count || 0,
        page: Math.floor(skip / take) + 1,
        limit: take,
      },
    });
  } catch (error) {
    console.error('[v0] GET /api/users error:', error);
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
