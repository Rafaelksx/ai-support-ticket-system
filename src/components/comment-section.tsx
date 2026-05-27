'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function CommentSection({
  ticketId,
  userRole,
  userId,
}: {
  ticketId: string;
  userRole: string;
  userId: string;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchComments();
    // Subscribe to real-time updates
    const supabase = createClient();
    const channel = supabase
      .channel(`comments:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          // Fetch the new comment with author data
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const fetchComments = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('comments')
      .select('id, content, is_ai_generated, created_at, author:profiles(full_name, role)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    setComments(data || []);
    setIsLoading(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('comments').insert({
        ticket_id: ticketId,
        author_id: userId,
        content: newComment,
        is_ai_generated: false,
      });

      if (!error) {
        setNewComment('');
        await fetchComments();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Conversación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="text-slate-400 text-sm">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-slate-400 text-sm">No hay comentarios aún</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg ${
                  comment.is_ai_generated
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'bg-slate-700/30 border border-slate-600/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-200">
                        {comment.author?.full_name}
                      </p>
                      {comment.author?.role && (
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 capitalize">
                          {comment.author.role}
                        </span>
                      )}
                      {comment.is_ai_generated && (
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          IA
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(comment.created_at).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-slate-700">
          <textarea
            className={`
              w-full px-3.5 py-2 text-sm rounded-lg bg-white/50 dark:bg-slate-900/40 
              border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100
              placeholder-slate-400 dark:placeholder-slate-500
              transition-all duration-200 backdrop-blur-sm
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
              disabled:opacity-50
              min-h-20 resize-none
            `}
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSending}
          />
          <Button type="submit" isLoading={isSending} className="w-full">
            {isSending ? 'Enviando...' : 'Enviar Comentario'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
