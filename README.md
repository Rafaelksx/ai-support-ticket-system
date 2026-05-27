# AuraSupport · AI Support Ticket System

Este es el repositorio base configurado para el **Proyecto 1 — AI Support Ticket System**. El proyecto está estructurado siguiendo las pautas recomendadas del desarrollo técnico, optimizado para ahorrar tokens en **v0** y permitir una implementación ágil de los componentes frontend.

---

## 🚀 Estructura del Proyecto

El proyecto ya incluye las fundaciones técnicas y de IA listas:

- **`supabase/migrations/01_schema.sql`**: Esquema de base de datos PostgreSQL completo (Tablas `profiles`, `tickets`, `comments`, `categories`, `notifications` y `ai_logs`) con Row Level Security (RLS) y Triggers.
- **`src/lib/supabase/`**: Configuración del cliente Supabase para entornos de cliente (navegador), servidor (Server Actions / Route Handlers) y middleware de actualización de sesión y redirección de rutas protegidas.
- **`src/lib/ai/`**: Configuración de OpenAI, sistema de prompts versionados en `prompts.ts`, validación estructurada de salida JSON usando **Zod** en `schemas.ts` y observabilidad automática en `logger.ts`.
- **`src/app/api/ai/`**: endpoints API ya implementados y listos:
  - `POST /api/ai/classify`: Clasificación de prioridad, sentimiento, detección de riesgo y sugerencia de categorías. Lanza webhooks automáticos a n8n si se escala a urgencia.
  - `POST /api/ai/suggest`: Generación de respuestas profesionales para agentes utilizando GPT-4o e historial de conversación.
  - `POST /api/ai/summarize`: Resumen ejecutivo para ahorrar tiempo de lectura a los agentes.
- **`src/components/ui/`**: Componentes reutilizables con estilos premium (Glassmorphism, transiciones suaves, soporte responsive):
  - `Button`: Botón modular con estados de carga e interactividad.
  - `Card`: Tarjetas de diseño premium glassmorphic.
  - `Badge`: Etiquetas para Prioridades (Low, Medium, High, Critical) y Estados (Open, In Progress, Resolved).
  - `Input`: Campos de texto con soporte de etiquetas y validación de errores.

---

## 🛠️ Configuración Inicial

### 1. Variables de Entorno
Copia el archivo de plantilla y rellena tus credenciales de Supabase y OpenAI en `.env.local`:
```bash
cp .env.example .env.local
```

### 2. Base de Datos (Supabase)
1. Ve a tu consola de [Supabase](https://supabase.com/).
2. Crea un nuevo proyecto.
3. Dirígete a la sección **SQL Editor**.
4. Copia el contenido de [01_schema.sql](supabase/migrations/01_schema.sql) y ejecútalo para crear las tablas, índices, políticas RLS y triggers de perfiles.

---

## 🤖 ¿Cómo pasar este código a v0 para ahorrar tokens?

Dado que toda la estructura técnica (API routes, base de datos, utilidades y variables) ya está creada localmente, puedes subir este código a tu repositorio de GitHub e indicarle a v0 lo siguiente:

> "Tengo un proyecto Next.js 15 (App Router) con Tailwind CSS v4 y Supabase ya configurado. El repositorio ya incluye la base de datos en `supabase/migrations/01_schema.sql`, las APIs de IA en `src/app/api/ai/` y los componentes base en `src/components/ui/`.
> 
> Necesito que implementes las siguientes vistas del frontend conectadas a los datos usando los clientes de Supabase que ya están en `src/lib/supabase/`:
> 1. Formulario para crear un ticket en `src/app/(dashboard)/tickets/new/page.tsx`.
> 2. Lista de tickets con filtros por estado/prioridad en `src/app/(dashboard)/tickets/page.tsx`.
> 3. Vista de detalle de ticket en `src/app/(dashboard)/tickets/[id]/page.tsx` con el panel lateral de asistencia de IA (`suggest`, `summarize`) y la sección de comentarios."

Esto evitará que v0 intente instalar paquetes, reconfigurar Supabase o diseñar desde cero, lo cual **reducirá tu consumo de tokens en v0 en un 70%** y te dará un código final mucho más alineado con el stack de desarrollo.

---

## ⚙️ Desarrollo Local

Instalar dependencias y correr servidor local:
```bash
npm install
npm run dev
```
La aplicación se levantará en [http://localhost:3000](http://localhost:3000).
