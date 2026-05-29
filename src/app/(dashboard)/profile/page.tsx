'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
  User, Mail, Shield, Calendar, KeyRound,
  CheckCircle, AlertCircle, Pencil, Loader2,
} from 'lucide-react';

const roleMeta: Record<string, { label: string; variant: 'primary' | 'success' | 'secondary' }> = {
  admin:  { label: 'Administrador', variant: 'primary' },
  agent:  { label: 'Agente',        variant: 'success'  },
  user:   { label: 'Usuario',       variant: 'secondary' },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Name form
  const [fullName, setFullName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFullName(data.full_name || '');
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingName(true);
    setNameMsg(null);

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName }),
    });
    const data = await res.json();

    if (res.ok) {
      setProfile((p: any) => ({ ...p, full_name: fullName }));
      setNameMsg({ ok: true, text: '¡Nombre actualizado correctamente!' });
    } else {
      setNameMsg({ ok: false, text: data.error || 'Error al actualizar el nombre' });
    }
    setIsSavingName(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: 'Las contraseñas nuevas no coinciden' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    // Verify current password by re-signing in
    setIsSavingPassword(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (signInError) {
      setPasswordMsg({ ok: false, text: 'La contraseña actual es incorrecta' });
      setIsSavingPassword(false);
      return;
    }

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      setPasswordMsg({ ok: true, text: '¡Contraseña actualizada correctamente!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ ok: false, text: data.error || 'Error al actualizar la contraseña' });
    }
    setIsSavingPassword(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const role = roleMeta[profile?.role] ?? roleMeta.user;
  const initials = (profile?.full_name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl space-y-8 animate-fade-up">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Mi Cuenta</span>
        </div>
        <h1 className="text-4xl font-bold gradient-text">Perfil</h1>
        <p className="text-slate-400 mt-1">Gestiona tu información personal y seguridad</p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/25 shrink-0">
              {initials}
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-slate-100">{profile?.full_name}</h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                {profile?.email}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={role.variant} dot>
                  <Shield className="w-3 h-3" />
                  {role.label}
                </Badge>
                {profile?.email_confirmed_at && (
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3" />
                    Email verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            Miembro desde{' '}
            {new Date(profile?.created_at).toLocaleDateString('es-MX', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Pencil className="w-4 h-4 text-indigo-400" />
            </div>
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveName} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="profile-email">
                Correo Electrónico
              </label>
              <Input
                id="profile-email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-600">El correo electrónico no se puede cambiar</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="profile-name">
                Nombre Completo
              </label>
              <Input
                id="profile-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                required
                className="input-glow"
              />
            </div>

            {nameMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border animate-fade-in ${
                nameMsg.ok
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}>
                {nameMsg.ok
                  ? <CheckCircle className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />
                }
                {nameMsg.text}
              </div>
            )}

            <Button type="submit" variant="primary" className="gap-2" isLoading={isSavingName}>
              {!isSavingName && <Pencil className="w-4 h-4" />}
              Guardar Nombre
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <KeyRound className="w-4 h-4 text-purple-400" />
            </div>
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="current-pass">
                Contraseña Actual
              </label>
              <Input
                id="current-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Tu contraseña actual"
                required
                className="input-glow"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="new-pass">
                  Nueva Contraseña
                </label>
                <Input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mín. 8 caracteres"
                  required
                  className="input-glow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="confirm-pass">
                  Confirmar
                </label>
                <Input
                  id="confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva"
                  required
                  className="input-glow"
                />
              </div>
            </div>

            {passwordMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border animate-fade-in ${
                passwordMsg.ok
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}>
                {passwordMsg.ok
                  ? <CheckCircle className="w-4 h-4 shrink-0" />
                  : <AlertCircle className="w-4 h-4 shrink-0" />
                }
                {passwordMsg.text}
              </div>
            )}

            <Button type="submit" variant="secondary" className="gap-2" isLoading={isSavingPassword}>
              {!isSavingPassword && <KeyRound className="w-4 h-4" />}
              Cambiar Contraseña
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  );
}
