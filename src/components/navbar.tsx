'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { MobileMenu } from '@/components/mobile-menu';

export function NavBar({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="h-16 border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-40">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 flex-1 md:flex-none">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-white">AuraSupport</h2>
            <p className="text-xs text-slate-400 capitalize hidden sm:block">{userRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <span className="text-sm text-slate-300 hidden sm:inline">{userName}</span>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs md:text-sm">
            Salir
          </Button>
          <MobileMenu userRole={userRole} />
        </div>
      </div>
    </nav>
  );
}
