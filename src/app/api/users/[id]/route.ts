import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  getAuthUser,
  validateRequestBody,
  checkUserRole,
  errorResponse,
  successResponse,
  methodNotAllowed,
  logAPICall,
} from '@/lib/api-helpers';

// Validation schema for updating user role
const updateUserRoleSchema = z.object({
  role: z.enum(['admin' as const, 'agent' as const, 'user' as const]).refine(
    (val) => ['admin', 'agent', 'user'].includes(val),
    { message: 'Role must be admin, agent, or user' }
  ),
});

/**
 * PATCH /api/users/[id] - Update user role (admin only)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  const startTime = Date.now();

  try {
    const user = await getAuthUser(request);
    if (!user) {
      return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
    }

    // Check admin permission
    const isAdmin = await checkUserRole(user.id, ['admin']);
    if (!isAdmin) {
      return errorResponse('Solo administradores pueden cambiar roles', 'FORBIDDEN', 403);
    }

    // Prevent admin from removing their own admin role
    if (id === user.id) {
      const validation = await validateRequestBody(request, updateUserRoleSchema);
      if (validation.valid && (validation.data as any).role !== 'admin') {
        return errorResponse('No puedes remover tu propio rol de administrador', 'FORBIDDEN', 403);
      }
    }

    // Validate request body
    const validation = await validateRequestBody(request, updateUserRoleSchema);
    if (!validation.valid) {
      return errorResponse(validation.error || 'Datos inválidos', 'VALIDATION_ERROR', 400);
    }

    const { role } = validation.data as any;
    const supabase = await createClient();

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[v0] Error updating user role:', error);
      return errorResponse('Error al actualizar rol de usuario', 'DATABASE_ERROR', 500);
    }

    await logAPICall(`/api/users/${id}`, 'PATCH', user.id, 200, Date.now() - startTime, {
      new_role: role,
    });

    // Create notification for user about role change
    await supabase.from('notifications').insert([
      {
        user_id: id,
        title: 'Tu rol ha sido actualizado',
        message: `Tu rol de acceso ha sido cambiado a ${role}`,
      },
    ]);

    return successResponse(updatedUser);
  } catch (error) {
    console.error('[v0] PATCH /api/users/[id] error:', error);
    return errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

/**
 * Handle unsupported methods
 */
