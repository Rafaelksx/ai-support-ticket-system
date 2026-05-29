'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setNotifications(data || []);
      }
      setIsLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Cargando notificaciones...</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Notificaciones</h1>
        <p className="text-slate-400">
          {unreadCount} no leída{unreadCount !== 1 ? 's' : ''}
        </p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">No hay notificaciones</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tu Centro de Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.is_read
                      ? 'border-slate-700 bg-slate-900/50'
                      : 'border-indigo-600/50 bg-indigo-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <Badge className="bg-indigo-600">Nuevo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Marcar como leída
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
