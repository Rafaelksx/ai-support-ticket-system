'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Hook to subscribe to realtime ticket updates
 */
export function useTicketUpdates(ticketId: string | null) {
  const [updates, setUpdates] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    const supabase = createClient();

    // Subscribe to ticket changes
    const channel = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[v0] Ticket update received:', payload);
          setUpdates(payload);
          setIsConnected(true);
        }
      )
      .subscribe((status) => {
        console.log('[v0] Channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  return { updates, isConnected };
}

/**
 * Hook to subscribe to realtime comment updates for a ticket
 */
export function useCommentUpdates(ticketId: string | null) {
  const [comments, setComments] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    const supabase = createClient();

    // Subscribe to comments changes
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
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[v0] New comment received:', payload);
          // Fetch the full comment with author info
          supabase
            .from('comments')
            .select(
              `
              *,
              author:author_id (id, full_name, email, role)
            `
            )
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setComments((prev) => [data, ...prev]);
              }
            });
          setIsConnected(true);
        }
      )
      .subscribe((status) => {
        console.log('[v0] Comments channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  return { comments, isConnected };
}

/**
 * Hook to subscribe to realtime notification updates
 */
export function useNotificationUpdates() {
  const [newNotification, setNewNotification] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // Subscribe to notifications for current user
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log('[v0] New notification received:', payload);
            setNewNotification(payload.new);
            setIsConnected(true);
          }
        )
        .subscribe((status) => {
          console.log('[v0] Notifications channel status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, []);

  return { newNotification, isConnected };
}

/**
 * Hook to subscribe to realtime updates for all tickets (for agents)
 */
export function useAllTicketUpdates() {
  const [update, setUpdate] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Get current user to check if they're an agent
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data || !['agent', 'admin'].includes(data.role)) return;

          // Subscribe to all ticket changes for agents/admins
          const channel = supabase
            .channel('all_tickets')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'tickets',
              },
              (payload: RealtimePostgresChangesPayload<any>) => {
                console.log('[v0] Ticket update (any):', payload);
                setUpdate(payload);
                setIsConnected(true);
              }
            )
            .subscribe((status) => {
              console.log('[v0] All tickets channel status:', status);
              setIsConnected(status === 'SUBSCRIBED');
            });

          return () => {
            supabase.removeChannel(channel);
          };
        });
    });
  }, []);

  return { update, isConnected };
}
