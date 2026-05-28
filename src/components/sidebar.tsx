'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Ticket, PlusCircle, Bell, Users, TrendingUp, type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard',      label: 'Dashboard',        Icon: LayoutDashboard },
  { href: '/tickets',        label: 'Tickets',           Icon: Ticket          },
  { href: '/tickets/new',    label: 'Nuevo Ticket',      Icon: PlusCircle      },
  { href: '/notifications',  label: 'Notificaciones',    Icon: Bell            },
  { href: '/admin/users',    label: 'Gestionar Usuarios',Icon: Users, adminOnly: true },
  { href: '/admin/metrics',  label: 'Métricas',          Icon: TrendingUp, adminOnly: true },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-700 bg-slate-900/50 backdrop-blur h-full">
      <div className="p-6 space-y-6">
        <nav className="space-y-1">
          {navItems.map(({ href, label, Icon, adminOnly }) => {
            if (adminOnly && userRole !== 'admin') return null;

            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
