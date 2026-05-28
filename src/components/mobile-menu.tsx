'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Ticket, PlusCircle, Settings, Menu, X, type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/',            label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/tickets',     label: 'Tickets',   Icon: Ticket          },
  { href: '/tickets/new', label: 'Nuevo',     Icon: PlusCircle      },
  { href: '/admin',       label: 'Admin',     Icon: Settings, adminOnly: true },
];

export function MobileMenu({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 md:hidden z-50">
          <nav className="space-y-1 p-4">
            {navItems.map(({ href, label, Icon, adminOnly }) => {
              if (adminOnly && userRole !== 'admin') return null;

              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
