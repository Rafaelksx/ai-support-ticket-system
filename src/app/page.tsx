import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LandingPageClient } from './landing-page-client';

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If already authenticated, redirect to /dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Otherwise, render public landing page
  return <LandingPageClient />;
}
