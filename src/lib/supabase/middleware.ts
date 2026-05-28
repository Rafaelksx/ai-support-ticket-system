import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT remove this. This is required for Server Actions
  // to work properly and for refreshing expired sessions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Role authorization and routing logic
  const url = request.nextUrl.clone();
  const isAuthPage = url.pathname.startsWith('/login') || url.pathname.startsWith('/register');
  const isPublicPage = url.pathname === '/' || isAuthPage;
  
  // Protect dashboard routes (everything except landing page, login, and register)
  const isProtectedRoute = !isPublicPage;

  if (!user && isProtectedRoute) {
    // If user is not logged in and tries to access protected route, redirect to login
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    // If user is logged in and tries to access auth pages, redirect to dashboard
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
