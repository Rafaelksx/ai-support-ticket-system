'use client';

import useSWR from 'swr';
import { TicketWithRelations, Ticket, TicketStatus, TicketPriority } from '@/types/database';
import { API_ROUTES } from '@/lib/constants';

interface FetchTicketsParams {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  assigned_to?: string;
  category_id?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
};

/**
 * Hook to fetch list of tickets with filtering
 */
export function useTickets(params?: FetchTicketsParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.priority) queryParams.append('priority', params.priority);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.assigned_to) queryParams.append('assigned_to', params.assigned_to);
  if (params?.category_id) queryParams.append('category_id', params.category_id);

  const url = `${API_ROUTES.TICKETS.LIST}?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  return {
    tickets: data?.data?.data || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch a single ticket with comments
 */
export function useTicket(ticketId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    ticketId ? `${API_ROUTES.TICKETS.DETAIL(ticketId)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000,
    }
  );

  return {
    ticket: data?.data as TicketWithRelations | undefined,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to create a new ticket
 */
export function useCreateTicket() {
  const createTicket = async (title: string, description: string, category_id?: string) => {
    const res = await fetch(API_ROUTES.TICKETS.CREATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category_id }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'Failed to create ticket');
    }

    return res.json();
  };

  return { createTicket };
}

/**
 * Hook to update a ticket
 */
export function useUpdateTicket() {
  const updateTicket = async (
    ticketId: string,
    updates: Partial<Ticket>
  ) => {
    const res = await fetch(API_ROUTES.TICKETS.UPDATE(ticketId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'Failed to update ticket');
    }

    return res.json();
  };

  return { updateTicket };
}
