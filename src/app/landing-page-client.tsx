'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Zap, Sparkles, Cpu, Layers,
  Mail, LayoutDashboard, User, Users, CheckCircle2,
  MessageSquare, ChevronDown, Award, TrendingUp, ShieldAlert,
  ArrowRightLeft, Database, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LandingPageClient() {
  const [activeTab, setActiveTab] = useState<'client' | 'agent' | 'admin'>('client');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: '¿Cómo funciona la Inteligencia Artificial en AuraSupport?',
      a: 'AuraSupport utiliza el modelo avanzado Gemini de Google a través de llamadas optimizadas de API. Cuando se crea un ticket, la IA analiza el texto para determinar la categoría del problema, la urgencia (prioridad) y el estado emocional (sentimiento) del cliente. Además, ofrece resúmenes y redacta borradores de respuesta basados en el historial del ticket.'
    },
    {
      q: '¿Qué es n8n y qué papel juega en el ecosistema?',
      a: 'n8n es un motor de automatización de flujos de trabajo (workflows). En AuraSupport, n8n actúa en segundo plano conectando la base de datos Supabase con servicios de mensajería externa. Se encarga de enviar correos automáticos al cliente cuando se crea un ticket, alertar al administrador sobre incidentes críticos por Gmail, y generar el reporte consolidado de rendimiento diario.'
    },
    {
      q: '¿Puedo personalizar los roles y permisos de los usuarios?',
      a: 'Sí, AuraSupport cuenta con tres roles integrados y protegidos mediante políticas de seguridad a nivel de fila (RLS) en Supabase: Clientes (que solo ven sus tickets reportados), Agentes (que pueden modificar y responder cualquier ticket asignado usando IA) y Administradores (con acceso a paneles globales de métricas y gestión de agentes).'
    },
    {
      q: '¿El sistema está listo para producción?',
      a: 'Totalmente. AuraSupport está construido sobre Next.js 15 (App Router), con autenticación segura y persistencia a través de Supabase PostgreSQL, e integrado con flujos reales en n8n. Toda la infraestructura se despliega eficientemente en Vercel.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white bg-clip-text">
              AuraSupport
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Características</a>
            <a href="#roles" className="hover:text-white transition-colors">Roles</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Cómo Funciona</a>
            <a href="#tech" className="hover:text-white transition-colors">Tecnologías</a>
            <a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
          </nav>

          {/* Nav Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20">
                Comenzar Gratis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4">
            <nav className="flex flex-col gap-3 font-medium text-slate-300">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Características</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Roles</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Cómo Funciona</a>
              <a href="#tech" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Tecnologías</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1">Preguntas Frecuentes</a>
            </nav>
            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full text-slate-300">Iniciar Sesión</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-indigo-600">Comenzar Gratis</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            Ecosistema de Soporte 2.0
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none">
            Soporte Técnico Asistido por <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Inteligencia Artificial</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Optimiza la atención de incidentes con clasificación automática de Gemini, automatización de flujos de n8n y un panel interactivo premium.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 px-8 h-12 shadow-lg shadow-indigo-600/30 text-base font-semibold group">
                Crear una Cuenta
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-900 px-8 h-12 text-base">
                Acceso Agentes
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="mt-16 md:mt-24 relative rounded-2xl border border-slate-800/80 bg-slate-900/30 p-2 sm:p-4 backdrop-blur-md shadow-2xl shadow-indigo-500/5">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent -bottom-2 z-10 pointer-events-none rounded-2xl" />
          
          {/* Header Mockup */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="text-xs text-slate-500 font-mono ml-2">https://aurasupport.io/dashboard</span>
            </div>
            <Badge className="bg-slate-800 text-slate-400 border-none font-mono text-[10px]">Agente Vista</Badge>
          </div>

          {/* Inner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Sidebar Mock */}
            <div className="lg:col-span-3 space-y-2 border-r border-slate-800/60 pr-4 hidden lg:block">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-300 border border-indigo-500/20 text-xs font-semibold flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-indigo-400" /> Dashboard
              </div>
              <div className="p-2 text-slate-400 hover:bg-slate-800/30 rounded-lg text-xs flex items-center gap-2">
                <Layers className="w-4 h-4" /> Tickets
              </div>
              <div className="p-2 text-slate-400 hover:bg-slate-800/30 rounded-lg text-xs flex items-center gap-2">
                <Users className="w-4 h-4" /> Gestión Agentes
              </div>
              <div className="p-2 text-slate-400 hover:bg-slate-800/30 rounded-lg text-xs flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Métricas
              </div>
            </div>

            {/* Content Mock */}
            <div className="lg:col-span-9 space-y-4">
              {/* KPI Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-medium">TICKETS ABIERTOS</p>
                  <p className="text-xl font-bold text-white">12</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-medium">Urgentes por IA</p>
                  <p className="text-xl font-bold text-red-400">4 <span className="text-xs font-normal text-slate-500">críticos</span></p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-slate-500 font-medium">EFICIENCIA SLA</p>
                  <p className="text-xl font-bold text-emerald-400">97.8%</p>
                </div>
              </div>

              {/* Main Ticket Showcase */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
                {/* Ticket Title */}
                <div className="flex flex-wrap gap-2 justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-mono">TICKET #2408</span>
                    <h3 className="text-sm font-semibold text-white">Falla crítica de integración en API de n8n</h3>
                  </div>
                  <div className="flex gap-1">
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">Crítico</Badge>
                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[10px]">En Progreso</Badge>
                  </div>
                </div>

                {/* Body Message */}
                <div className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded border border-slate-800/40">
                  <p className="font-semibold text-slate-300 mb-1">Cliente: Carlos Mendoza</p>
                  "El webhook de n8n no está respondiendo a las peticiones POST de Supabase. La tarea diaria de consolidación falló anoche y necesitamos que se revise el token de acceso o las credenciales del servicio de inmediato. Adjunto el log de error de Vercel..."
                </div>

                {/* Gemini AI Card Assist */}
                <div className="bg-indigo-950/20 rounded-xl border border-indigo-500/20 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <Sparkles className="w-5 h-5 text-indigo-400/30 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 mb-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    Asistente de Inteligencia Artificial (Gemini)
                  </div>

                  {/* AI Metadata Tags */}
                  <div className="flex gap-3 text-[10px] text-slate-400 mb-3 border-b border-indigo-500/10 pb-2">
                    <span>Sentimiento: <strong className="text-red-400">😡 Enojado / Frustrado</strong></span>
                    <span>Categoría: <strong className="text-indigo-300">Integración de API</strong></span>
                    <span>Precisión: <strong className="text-indigo-400">96.8%</strong></span>
                  </div>

                  {/* Sugerencia de Respuesta */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Respuesta Sugerida por IA:</p>
                    <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded border border-indigo-500/10 leading-relaxed italic">
                      "Hola Carlos, lamentamos la interrupción en el webhook de n8n. Hemos identificado que las credenciales de Supabase del rol de servicio expiraron o cambiaron. Estamos restableciendo la clave `SUPABASE_SERVICE_ROLE_KEY` en los flujos de n8n. Por favor, danos 5 minutos para confirmar la reactivación."
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button size="sm" variant="ghost" className="text-slate-400 text-[10px] hover:text-white h-7">Modificar</Button>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] h-7 px-3 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Usar Borrador IA
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY METRICS / STATS ─────────────────────────────────────────── */}
      <section className="bg-slate-900/20 border-y border-slate-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2 p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-4xl font-extrabold text-white">98%</p>
            <h3 className="text-sm font-semibold text-slate-200">Autoclasificación con IA</h3>
            <p className="text-xs text-slate-400">Tickets categorizados por sentimiento y prioridad en milisegundos.</p>
          </div>
          <div className="space-y-2 p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-extrabold text-white">&lt; 2 min</p>
            <h3 className="text-sm font-semibold text-slate-200">Respuesta Sugerida</h3>
            <p className="text-xs text-slate-400">Plantillas de respuesta contextuales redactadas de forma automática por Gemini.</p>
          </div>
          <div className="space-y-2 p-6 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5 text-sky-400" />
            </div>
            <p className="text-4xl font-extrabold text-white">100%</p>
            <h3 className="text-sm font-semibold text-slate-200">Notificaciones en Tiempo Real</h3>
            <p className="text-xs text-slate-400">Integración con n8n para alertas por email en incidentes críticos y reportes diarios.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ────────────────────────────────────────────── */}
      <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ecosistema Todo en Uno</h2>
          <p className="text-slate-400 font-light">Diseñado para optimizar todos los puntos de contacto del proceso de asistencia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Card className="border-slate-800 bg-slate-900/20 backdrop-blur hover:bg-slate-900/40 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Motor IA Gemini</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Gemini analiza la intención y el enojo del usuario de forma inmediata, permitiendo filtrar y derivar problemas antes de que tu equipo los lea.
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="border-slate-800 bg-slate-900/20 backdrop-blur hover:bg-slate-900/40 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Workflows con n8n</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatiza el envío de correos HTML detallados al cliente, alertas directas a los agentes y reportes a las 8 AM con las estadísticas clave del día.
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="border-slate-800 bg-slate-900/20 backdrop-blur hover:bg-slate-900/40 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Seguridad Avanzada</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Supabase garantiza que tus datos estén seguros usando políticas RLS estrictas. Los clientes solo ven y comentan sus propios reportes de soporte.
              </p>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="border-slate-800 bg-slate-900/20 backdrop-blur hover:bg-slate-900/40 transition-colors">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Diseño UI Premium</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Interfaz fluida y responsiva adaptada a modo oscuro por defecto. Incluye badges de colores, métricas dinámicas y diseño adaptado a móviles.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── ROLE EXPLORER SECTION ───────────────────────────────────────── */}
      <section id="roles" className="py-20 bg-slate-900/25 border-y border-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Roles Especializados</h2>
            <p className="text-slate-400 font-light">Una interfaz optimizada para cada perfil participante en el soporte.</p>
          </div>

          {/* Tabs Nav */}
          <div className="flex justify-center border-b border-slate-800 max-w-lg mx-auto">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex-1 pb-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'client'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Clientes
            </button>
            <button
              onClick={() => setActiveTab('agent')}
              className={`flex-1 pb-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'agent'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Agentes
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 pb-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'admin'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Administradores
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-8">
            <div className="lg:col-span-5 space-y-6">
              {activeTab === 'client' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Portal del Cliente</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Permite a los usuarios crear incidentes de soporte técnico de forma simple e interactiva. Los clientes pueden seguir el estado de resolución en tiempo real, clasificados por categorías claras.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Creación rápida de incidentes con archivos o logs.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Historial unificado y comentarios en tiempo real.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" /> Notificaciones automáticas por correo electrónico.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'agent' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Panel de Agentes</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Diseñado para acelerar la resolución de tickets. Los agentes tienen acceso a asistentes de IA que analizan la prioridad del incidente y redactan respuestas profesionales a los clientes con un clic.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" /> Asistencia de respuestas sugeridas por Gemini.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" /> Generador de resúmenes de hilos de conversación extensos.
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" /> Filtros avanzados y asignación rápida de prioridades.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Centro del Administrador</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Supervisión completa del rendimiento técnico de la plataforma. Los administradores controlan los roles del equipo, monitorean la tasa de cumplimiento del SLA y analizan las métricas agregadas del sistema.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400" /> Dashboard de métricas globales (tasa de resolución, carga de trabajo).
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400" /> Gestión total de roles de usuarios (Clientes/Agentes/Admins).
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400" /> Control y reportes automatizados de cumplimiento.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Visual Panel Mockup */}
            <div className="lg:col-span-7 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 min-h-[300px] flex items-center justify-center">
              {activeTab === 'client' && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-300">Reportar Nuevo Incidente</span>
                    <span className="text-[10px] text-slate-500">Formulario del Cliente</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Título del Problema</label>
                      <div className="w-full bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                        Error al conectar con la base de datos de producción
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Descripción Corta</label>
                      <div className="w-full bg-slate-950 p-2.5 rounded border border-slate-800 h-16 text-slate-400">
                        Estamos recibiendo errores 500 intermitentes al guardar datos en el esquema public. Necesitamos soporte urgente.
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-indigo-400">✓ Tu email ya fue adjuntado</span>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] h-8 px-4">
                        Crear Ticket
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'agent' && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-300">Acciones de IA de Agente</span>
                    <span className="text-[10px] text-slate-500">Asistencia Inteligente</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center hover:border-indigo-500/40 transition-colors cursor-pointer group">
                      <Sparkles className="w-5 h-5 text-indigo-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-slate-200 block">Sugerir Respuesta</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Gemini redactará un borrador formal.</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded border border-slate-800 text-center hover:border-purple-500/40 transition-colors cursor-pointer group">
                      <Layers className="w-5 h-5 text-purple-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-slate-200 block">Resumir Historial</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Extrae puntos clave del caso.</span>
                    </div>
                  </div>
                  <div className="bg-indigo-950/20 p-2.5 rounded border border-indigo-500/10 text-[10px] text-indigo-300">
                    💡 <strong>Tip de Productividad:</strong> Clasifica tickets y responde en menos del 50% de tiempo promedio.
                  </div>
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-300">Resumen del Estado de SLA</span>
                    <span className="text-[10px] text-slate-500">Vista del Administrador</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Tickets Resueltos Hoy</span>
                      <span className="font-bold text-white">18 de 20 (90%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '90%' }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">TIEMPO MEDIO RESOLUCIÓN</span>
                        <span className="text-sm font-bold text-emerald-400">1.4 horas</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">AGENTE MÁS ACTIVO</span>
                        <span className="text-sm font-bold text-purple-400">Sofía Ramos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Flujo de Resolución Automatizado</h2>
          <p className="text-slate-400 font-light">¿Cómo viajan tus incidentes desde el reporte del cliente hasta el cierre exitoso?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/4 left-[10%] right-[10%] h-0.5 bg-slate-800/80 -z-10" />

          {/* Step 1 */}
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400 font-bold text-lg shadow-lg relative">
              1
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-300">✍</span>
            </div>
            <h3 className="font-bold text-white text-base">Creación del Ticket</h3>
            <p className="text-xs text-slate-400 px-4">
              El cliente reporta su problema técnico en su portal web.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400 font-bold text-lg shadow-lg relative">
              2
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-300">🤖</span>
            </div>
            <h3 className="font-bold text-white text-base">Análisis de IA</h3>
            <p className="text-xs text-slate-400 px-4">
              Gemini detecta el sentimiento, sugiere prioridad y asigna categoría del ticket.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400 font-bold text-lg shadow-lg relative">
              3
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-300">✉</span>
            </div>
            <h3 className="font-bold text-white text-base">Workflows n8n</h3>
            <p className="text-xs text-slate-400 px-4">
              n8n gatilla alertas instantáneas por correo para agentes y avisos al cliente.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400 font-bold text-lg shadow-lg relative">
              4
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] text-indigo-300">✓</span>
            </div>
            <h3 className="font-bold text-white text-base">Resolución Rápida</h3>
            <p className="text-xs text-slate-400 px-4">
              El agente responde asistido por IA. El ticket se marca como solucionado.
            </p>
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY STACK SECTION ────────────────────────────────────── */}
      <section id="tech" className="py-20 bg-slate-900/15 border-t border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Tecnologías Modernas</h2>
            <p className="text-slate-400 font-light">Una infraestructura robusta para garantizar máxima velocidad y seguridad.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center hover:border-slate-700 transition-colors">
              <Globe className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Next.js 15</h4>
              <p className="text-[10px] text-slate-500 mt-1">App Router / Server Components</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center hover:border-slate-700 transition-colors">
              <Database className="w-8 h-8 text-sky-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Supabase</h4>
              <p className="text-[10px] text-slate-500 mt-1">Postgres / RLS / Autenticación</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center hover:border-slate-700 transition-colors">
              <Cpu className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Gemini AI</h4>
              <p className="text-[10px] text-slate-500 mt-1">Clasificación y respuestas</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center hover:border-slate-700 transition-colors">
              <ArrowRightLeft className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">n8n</h4>
              <p className="text-[10px] text-slate-500 mt-1">Workflows automatizados</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center hover:border-slate-700 transition-colors">
              <ShieldAlert className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Tailwind CSS</h4>
              <p className="text-[10px] text-slate-500 mt-1">Estilado ágil y moderno</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center hover:border-slate-700 transition-colors">
              <Mail className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Gmail Integration</h4>
              <p className="text-[10px] text-slate-500 mt-1">Alertas automatizadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ─────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Preguntas Frecuentes</h2>
          <p className="text-slate-400 font-light">Resuelve tus dudas generales sobre el funcionamiento de AuraSupport.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900/30 rounded-xl border border-slate-850 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-white hover:bg-slate-900/50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-indigo-400' : ''
                  }`} 
                />
              </button>
              {openFaq === idx && (
                <div className="p-5 pt-0 border-t border-slate-850/30 text-sm text-slate-400 leading-relaxed bg-slate-950/20">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-950/40 to-slate-900/40 border border-indigo-500/25 p-8 md:p-16 text-center space-y-6 overflow-hidden">
          {/* Light glow inside */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            ¿Listo para Transformar tu Soporte Técnico?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto font-light text-base md:text-lg">
            Únete y comprueba cómo AuraSupport puede automatizar la atención a incidentes al instante con Gemini y n8n.
          </p>

          <div className="pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 px-8 h-12 shadow-lg shadow-indigo-600/30 font-semibold group">
                Comenzar Ahora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="font-semibold text-slate-300">AuraSupport Ecosystem</span>
          </div>

          <p className="text-center md:text-right">
            © {new Date().getFullYear()} AuraSupport. Desarrollado con Next.js, Supabase, n8n y Gemini AI. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
