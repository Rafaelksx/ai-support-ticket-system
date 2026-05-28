'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MobileMenu } from '@/components/mobile-menu';
import { LogOut, Zap, User } from 'lucide-react';

const roleMeta: Record<string, { label: string; color: string; bg: string }> = {
  admin:  { label: 'Admin',   color: 'text-purple-300', bg: 'bg-purple-500/10 border-purple-500/25' },
  agent:  { label: 'Agente',  color: 'text-sky-300',    bg: 'bg-sky-500/10 border-sky-500/25'       },
  user:   { label: 'Usuario', color: 'text-slate-300',  bg: 'bg-slate-700/50 border-slate-600/30'   },
};

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
    router.push('/');
    router.refresh();
  };

  const role = roleMeta[userRole] ?? roleMeta.user;
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="h-16 sticky top-0 z-40 flex items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="relative flex h-full w-full items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-lg bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <h2 className="text-sm font-bold gradient-text leading-none">AuraSupport</h2>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Sistema de Tickets</p>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-slate-200 leading-none">{userName}</p>
              <p className={`text-xs mt-0.5 ${role.color} leading-none`}>{role.label}</p>
            </div>

            {/* Role badge / avatar */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${role.color} ${role.bg}`}>
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">{role.label}</span>
              <span className="sm:hidden">{initials}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-700/60 hidden sm:block" />

          {/* Logout button */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Salir</span>
          </button>

          <MobileMenu userRole={userRole} />
        </div>
      </div>
    </nav>
  );
}
