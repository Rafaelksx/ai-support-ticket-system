'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

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
      <div className="text-center space-y-2 flex flex-col items-center">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors mb-2">
          ← Volver al Inicio
        </Link>
        <h1 className="text-3xl font-bold text-white">AuraSupport</h1>
        <p className="text-slate-300">Sistema de soporte técnico inteligente</p>
      </div>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Iniciar Sesión</CardTitle>
          <CardDescription className="text-slate-400">
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-center text-sm text-slate-400">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Registrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
