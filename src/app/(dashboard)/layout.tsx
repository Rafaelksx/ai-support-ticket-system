import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NavBar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  // If profile is not found (e.g. trigger didn't fire), use defaults so the page renders
  const userProfile = profile ?? { full_name: user.email ?? 'Usuario', role: 'user' as const };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <NavBar userName={userProfile.full_name} userRole={userProfile.role} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar userRole={userProfile.role} />

        <main className="flex-1 overflow-auto w-full">
          <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
