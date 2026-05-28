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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const userProfile = profile ?? { full_name: user.email ?? 'Usuario', role: 'user' as const };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fixed background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full animate-orb"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full animate-orb"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animationDelay: '-4s',
          }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-[400px] h-[400px] rounded-full animate-orb"
          style={{
            background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animationDelay: '-8s',
          }}
        />
      </div>

      <NavBar userName={userProfile.full_name} userRole={userProfile.role} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar userRole={userProfile.role} />
        <main className="flex-1 overflow-auto w-full">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
