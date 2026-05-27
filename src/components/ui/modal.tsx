'use client';

import { ReactNode } from 'react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full rounded-lg border border-slate-700 bg-slate-900/90 backdrop-blur-xl shadow-2xl ${sizeClasses[size]} p-6`}>
        {title && (
          <h2 className="mb-4 text-xl font-semibold text-white">{title}</h2>
        )}
        <div className="mb-4">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
