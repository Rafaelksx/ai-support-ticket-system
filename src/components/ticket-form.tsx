'use client';

import { FormEvent, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface TicketFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    category?: string;
    priority: string;
  }) => Promise<void>;
  isLoading?: boolean;
  categories?: Array<{ id: string; name: string }>;
}

export function TicketForm({ onSubmit, isLoading, categories = [] }: TicketFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('El título y la descripción son requeridos');
      return;
    }

    try {
      await onSubmit({ title, description, category, priority });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el ticket');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-600 bg-red-900/20 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Título *
        </label>
        <Input
          type="text"
          placeholder="Resumen del problema"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-1">
          Descripción *
        </label>
        <Textarea
          placeholder="Describe el problema en detalle..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Categoría
          </label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoading}
            options={[
              { value: '', label: 'Sin categoría' },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Prioridad
          </label>
          <Select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isLoading}
            options={[
              { value: 'low', label: 'Baja' },
              { value: 'medium', label: 'Media' },
              { value: 'high', label: 'Alta' },
              { value: 'critical', label: 'Crítica' },
            ]}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Creando...' : 'Crear Ticket'}
        </Button>
      </div>
    </form>
  );
}
