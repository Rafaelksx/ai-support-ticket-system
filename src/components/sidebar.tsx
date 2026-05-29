'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Ticket, PlusCircle, Bell, Users, TrendingUp, UserCircle, type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  adminOnly?: boolean;
  group?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard',     label: 'Dashboard',          Icon: LayoutDashboard, group: 'Principal' },
  { href: '/tickets',       label: 'Tickets',             Icon: Ticket,          group: 'Principal' },
  { href: '/tickets/new',   label: 'Nuevo Ticket',        Icon: PlusCircle,      group: 'Principal' },
  { href: '/notifications', label: 'Notificaciones',      Icon: Bell,            group: 'Principal' },
  { href: '/profile',       label: 'Mi Perfil',           Icon: UserCircle,      group: 'Cuenta'    },
  { href: '/admin/users',   label: 'Gestionar Usuarios',  Icon: Users,           group: 'Administración', adminOnly: true },
  { href: '/admin/metrics', label: 'Métricas',            Icon: TrendingUp,      group: 'Administración', adminOnly: true },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(({ adminOnly }) => !adminOnly || userRole === 'admin');
  const groups = [...new Set(visibleItems.map((i) => i.group))];

  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 h-full relative">
      {/* Border right */}
      <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-700/50 to-transparent" />

      {/* Background */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

      <div className="relative flex flex-col h-full py-6 px-3 gap-6">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              {group}
            </p>
            <nav className="space-y-0.5">
              {visibleItems
                .filter((i) => i.group === group)
                .map(({ href, label, Icon }) => {
                  const isActive =
                    pathname === href ||
                    (href !== '/' && pathname.startsWith(href + '/'));

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden ${
                        isActive
                          ? 'sidebar-active text-indigo-300'
                          : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Hover background sweep */}
                      {!isActive && (
                        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-0 bg-gradient-to-r from-slate-800/80 to-transparent transition-transform duration-300 rounded-xl" />
                      )}

                      {/* Icon */}
                      <span className={`relative shrink-0 p-1 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-indigo-500/15 text-indigo-300'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}>
                        <Icon className="w-4 h-4" strokeWidth={isActive ? 2.25 : 1.75} />
                      </span>

                      <span className="relative truncate">{label}</span>

                      {/* Active dot */}
                      {isActive && (
                        <span className="ml-auto relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-50" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                        </span>
                      )}
                    </Link>
                  );
                })}
            </nav>
          </div>
        ))}

        {/* Bottom version */}
        <div className="mt-auto px-3">
          <p className="text-[10px] text-slate-700 font-mono">v1.0.0 • AuraSupport</p>
        </div>
      </div>
    </aside>
  );
}
