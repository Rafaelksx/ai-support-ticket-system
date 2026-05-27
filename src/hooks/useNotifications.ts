'use client';

import useSWR from 'swr';
import { Notification } from '@/types/database';
import { API_ROUTES } from '@/lib/constants';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
};

/**
 * Hook to fetch notifications for current user
 */
export function useNotifications(unreadOnly: boolean = false) {
  const params = new URLSearchParams();
  if (unreadOnly) params.append('unread_only', 'true');

  const { data, error, isLoading, mutate } = useSWR(
    `${API_ROUTES.NOTIFICATIONS.LIST}?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    notifications: data?.data || [],
    unreadCount: data?.unread_count || 0,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationRead() {
  const markAsRead = async (notificationId: string) => {
    const res = await fetch(API_ROUTES.NOTIFICATIONS.MARK_READ(notificationId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'Failed to mark notification');
    }

    return res.json();
  };

  return { markAsRead };
}
