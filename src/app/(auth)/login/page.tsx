'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Zap, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        window.location.href = '/';
      } else {
        setError('Por favor confirma tu correo electrónico antes de iniciar sesión.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error durante el inicio de sesión.');
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
            <p className="text-slate-400 text-sm mt-1">Sistema de soporte técnico inteligente</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl glass-panel p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-100">Iniciar Sesión</h2>
          <p className="text-sm text-slate-400">Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="login-email">
              Correo Electrónico
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-glow"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide" htmlFor="login-password">
              Contraseña
            </label>
            <Input
              id="login-password"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-glow"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            id="login-submit"
            type="submit"
            variant="gradient"
            className="w-full gap-2 h-11 text-sm font-semibold"
            isLoading={isLoading}
          >
            {!isLoading && <LogIn className="w-4 h-4" />}
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className="pt-4 border-t border-white/[0.06]">
          <p className="text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
