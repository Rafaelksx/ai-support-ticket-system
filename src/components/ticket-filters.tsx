'use client';

import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TicketFiltersProps {
  status?: string;
  priority?: string;
  search?: string;
  onStatusChange?: (status: string) => void;
  onPriorityChange?: (priority: string) => void;
  onSearchChange?: (search: string) => void;
  onReset?: () => void;
}

export function TicketFilters({
  status,
  priority,
  search,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onReset,
}: TicketFiltersProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4 backdrop-blur">
      <h3 className="text-sm font-semibold text-slate-100">Filtros</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          type="text"
          placeholder="Buscar tickets..."
          value={search || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="text-xs"
        />
        
        <Select
          value={status || ''}
          onChange={(e) => onStatusChange?.(e.target.value)}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'open', label: 'Abierto' },
            { value: 'in_progress', label: 'En progreso' },
            { value: 'resolved', label: 'Resuelto' },
            { value: 'closed', label: 'Cerrado' },
          ]}
        />
        
        <Select
          value={priority || ''}
          onChange={(e) => onPriorityChange?.(e.target.value)}
          options={[
            { value: '', label: 'Todas las prioridades' },
            { value: 'low', label: 'Baja' },
            { value: 'medium', label: 'Media' },
            { value: 'high', label: 'Alta' },
            { value: 'critical', label: 'Crítica' },
          ]}
        />
      </div>
      
      {(status || priority || search) && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full sm:w-auto"
        >
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
