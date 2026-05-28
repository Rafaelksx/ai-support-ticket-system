'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Zap, ArrowLeft, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.push('/');
        router.refresh();
      } else {
        setSuccess('¡Cuenta creada! Revisa tu correo para verificarla y luego inicia sesión.');
        setTimeout(() => router.push('/login'), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error durante el registro');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors mb-1"
        >
          <ArrowLeft className="w-3 h-3" /> Volver al Inicio
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">AuraSupport</h1>
            <p className="text-slate-400 text-sm mt-1">Crea tu cuenta gratuita</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl glass-panel p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-100">Crear Cuenta</h2>
          <p className="text-sm text-slate-400">Completa el formulario para registrarte</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="reg-name">
              Nombre Completo
            </label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Tu nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="input-glow"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="reg-email">
              Correo Electrónico
            </label>
            <Input
              id="reg-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-glow"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="reg-pass">
                Contraseña
              </label>
              <Input
                id="reg-pass"
                type="password"
                placeholder="Mín. 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-glow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="reg-confirm">
                Confirmar
              </label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-glow"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <Button
            id="register-submit"
            type="submit"
            variant="gradient"
            className="w-full gap-2 h-11 text-sm font-semibold"
            isLoading={isLoading}
          >
            {!isLoading && <UserPlus className="w-4 h-4" />}
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </Button>
        </form>

        <div className="pt-4 border-t border-white/[0.06]">
          <p className="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
