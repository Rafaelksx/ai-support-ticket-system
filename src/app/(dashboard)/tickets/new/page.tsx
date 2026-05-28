'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('id, name').order('name');
      setCategories(data || []);
      setIsLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No autorizado');
        setIsLoading(false);
        return;
      }

      const { data: ticket, error: createError } = await supabase
        .from('tickets')
        .insert({
          title,
          description,
          category_id: categoryId || null,
          created_by: user.id,
          status: 'open',
          priority: 'medium',
        })
        .select('id')
        .single();

      if (createError) {
        setError(createError.message);
        setIsLoading(false);
        return;
      }

      if (ticket) {
        // Trigger AI classification
        try {
          await fetch('/api/ai/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId: ticket.id }),
          });
        } catch (err) {
          console.error('Failed to classify ticket:', err);
        }

        router.push(`/tickets/${ticket.id}`);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear el ticket');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Reportar un Incidente</h1>
        <p className="text-slate-400">Cuéntanos qué problema experimentas</p>
      </div>

      <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Nuevo Ticket</CardTitle>
          <CardDescription className="text-slate-400">
            Completa el formulario con los detalles de tu incidente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTicket} className="space-y-6">
            <Input
              label="Título del Incidente"
              placeholder="Resumen breve del problema"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase block mb-2">
                Descripción
              </label>
              <textarea
                className={`
                  w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
                  border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
                  placeholder-slate-400 dark:placeholder-slate-500
                  transition-all duration-200 backdrop-blur-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                  disabled:opacity-50 disabled:bg-slate-100/50 dark:disabled:bg-slate-950/20
                  min-h-32 resize-none
                `}
                placeholder="Describe en detalle el problema, qué hiciste antes de que ocurra y cualquier mensaje de error que recibiste..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase block mb-2">
                Categoría (Opcional)
              </label>
              <select
                className={`
                  w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
                  border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
                  transition-all duration-200 backdrop-blur-sm
                  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                `}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isLoadingCategories}
              >
                <option value="">Selecciona una categoría...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" isLoading={isLoading} className="flex-1">
                {isLoading ? 'Creando...' : 'Crear Ticket'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
