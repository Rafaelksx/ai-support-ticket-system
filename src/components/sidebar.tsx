'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: '📊',
  },
  {
    href: '/tickets',
    label: 'Tickets',
    icon: '🎫',
  },
  {
    href: '/tickets/new',
    label: 'Nuevo Ticket',
    icon: '➕',
  },
  {
    href: '/notifications',
    label: 'Notificaciones',
    icon: '🔔',
  },
  {
    href: '/admin/users',
    label: 'Gestionar Usuarios',
    icon: '👥',
    adminOnly: true,
  },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-700 bg-slate-900/50 backdrop-blur h-full">
      <div className="p-6 space-y-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            if (item.adminOnly && userRole !== 'admin') return null;

            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
