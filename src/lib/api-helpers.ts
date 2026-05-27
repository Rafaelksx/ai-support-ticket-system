import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { APIResponse } from '@/types/ai';

/**
 * Success response wrapper
 */
export function successResponse<T>(data: T, status: number = 200, metadata?: Record<string, any>): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      metadata,
    },
    { status }
  );
}

/**
 * Error response wrapper
 */
export function errorResponse(
  message: string,
  code: string = 'ERROR',
  status: number = 400,
  details?: unknown
): NextResponse<APIResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

/**
 * Get authenticated user from request
 */
export async function getAuthUser(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get user profile with role
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[v0] Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Check if user has required role
 */
export async function checkUserRole(userId: string, requiredRoles: string[]): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;
  return requiredRoles.includes(profile.role);
}

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: any
): Promise<{ valid: boolean; data?: T; error?: string }> {
  try {
    const body = await request.json();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return {
        valid: false,
        error: validationResult.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
    }

    return {
      valid: true,
      data: validationResult.data as T,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid JSON in request body',
    };
  }
}

/**
 * Handle method not allowed
 */
export function methodNotAllowed(allowedMethods: string[]): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Only ${allowedMethods.join(', ')} methods are allowed`,
      },
    },
    { status: 405, headers: { Allow: allowedMethods.join(', ') } }
  );
}

/**
 * Log API call for monitoring
 */
export async function logAPICall(
  endpoint: string,
  method: string,
  userId: string | null,
  statusCode: number,
  durationMs: number,
  metadata?: Record<string, any>
) {
  console.log(`[${new Date().toISOString()}] ${method} ${endpoint} - User: ${userId || 'anonymous'} - Status: ${statusCode} - Duration: ${durationMs}ms`, metadata);
}

/**
 * Rate limiting helper (simple in-memory solution)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < maxRequests) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * Paginate results
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function getPaginationParams(request: NextRequest): { skip: number; take: number; page: number; limit: number } {
  const searchParams = new URL(request.url).searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

/**
 * Build query filters for tickets
 */
export function buildTicketFilters(request: NextRequest, baseQuery: any) {
  const searchParams = new URL(request.url).searchParams;
  let query = baseQuery;

  if (searchParams.has('status')) {
    query = query.eq('status', searchParams.get('status'));
  }

  if (searchParams.has('priority')) {
    query = query.eq('priority', searchParams.get('priority'));
  }

  if (searchParams.has('assigned_to')) {
    const value = searchParams.get('assigned_to');
    if (value === 'unassigned') {
      query = query.is('assigned_to', null);
    } else {
      query = query.eq('assigned_to', value);
    }
  }

  if (searchParams.has('category_id')) {
    query = query.eq('category_id', searchParams.get('category_id'));
  }

  if (searchParams.has('search')) {
    const search = searchParams.get('search');
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  return query;
}

/**
 * Send webhook to n8n
 */
export async function sendWebhook(
  workflowId: string,
  payload: Record<string, any>,
  workflowUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = workflowUrl || process.env.N8N_WEBHOOK_URL;
    if (!url) {
      console.warn('[v0] N8N_WEBHOOK_URL not configured');
      return { success: false, error: 'Webhook not configured' };
    }

    const response = await fetch(`${url}/${workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('[v0] Webhook error:', error);
    return { success: false, error: String(error) };
  }
}
