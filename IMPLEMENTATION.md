# AuraSupport - Sistema de Soporte Técnico con IA

## Resumen de la Implementación

Se han completado todas las vistas de interfaz de usuario del sistema de soporte técnico inteligente con integración de Supabase, autenticación, gestión de tickets y panel de IA para agentes.

## Estructura de Archivos Creados

### Páginas de Autenticación
- `src/app/(auth)/layout.tsx` - Layout para páginas de auth
- `src/app/(auth)/login/page.tsx` - Página de iniciar sesión
- `src/app/(auth)/register/page.tsx` - Página de registro

### Layout del Dashboard
- `src/app/(dashboard)/layout.tsx` - Layout principal del dashboard
- `src/app/(dashboard)/page.tsx` - Dashboard principal con métricas

### Páginas de Tickets
- `src/app/(dashboard)/tickets/page.tsx` - Listado de tickets con filtros
- `src/app/(dashboard)/tickets/new/page.tsx` - Formulario para crear ticket
- `src/app/(dashboard)/tickets/[id]/page.tsx` - Detalle del ticket
- `src/app/(dashboard)/tickets/[id]/edit/page.tsx` - Edición de ticket (solo agents)

### Componentes Reutilizables
- `src/components/navbar.tsx` - Barra de navegación superior
- `src/components/sidebar.tsx` - Navegación lateral
- `src/components/mobile-menu.tsx` - Menú móvil
- `src/components/metric-card.tsx` - Tarjeta de métricas
- `src/components/comment-section.tsx` - Sección de comentarios con real-time
- `src/components/ai-assistant.tsx` - Panel de asistente de IA

### Configuración
- `tailwind.config.ts` - Configuración de Tailwind CSS v4

## Funcionalidades Implementadas

### 1. Autenticación
- Registro de nuevos usuarios
- Inicio de sesión con email/password
- Cierre de sesión
- Redirección automática según permisos

### 2. Dashboard Principal
- Métricas rápidas (total tickets, abiertos, urgentes, asignados)
- Tabla de tickets urgentes (solo para agents/admins)
- Vista responsive para desktop, tablet y móvil

### 3. Gestión de Tickets
- Crear nuevo ticket con categoría
- Listar tickets con filtros por estado y prioridad
- Ver detalles completos del ticket
- Editar estado, prioridad y asignación (solo agents)
- Control de permisos basado en rol RLS

### 4. Sistema de Comentarios
- Comentarios en tiempo real con Supabase
- Identificación del autor y rol
- Marca de comentarios generados por IA
- Formulario para agregar comentarios

### 5. Panel de Asistente de IA (solo agents)
- Información de clasificación: prioridad, sentimiento, riesgo
- Sugerencias de acción
- Resumen del ticket (llamada a `/api/ai/summarize`)
- Respuesta sugerida (llamada a `/api/ai/suggest`)
- Botón para copiar respuesta sugerida

### 6. Diseño Responsivo
- Mobile-first approach
- Tablas desktop con vista de tarjetas en móvil
- Navegación móvil con menú desplegable
- Espaciado adaptativo

## Flujos de Usuario

### Usuario (Rol: user)
1. Inicia sesión o se registra
2. Accede al dashboard con sus tickets
3. Puede crear un nuevo ticket
4. Ve el estado y comentarios en sus tickets
5. Agrega comentarios para el agente

### Agente (Rol: agent)
1. Inicia sesión
2. Ve dashboard con métricas globales
3. Ve tabla de tickets urgentes
4. Accede a detalle de tickets
5. En el lado derecho:
   - Panel de IA con análisis automático
   - Resumen del ticket
   - Sugerencia de respuesta (generada por IA)
   - Puede copiar la respuesta sugerida
6. Puede cambiar estado, prioridad y asignación
7. Agrega comentarios y responde a usuarios

### Admin (Rol: admin)
- Acceso completo a todas las funciones de agent
- Acceso a panel de admin (aún no implementado)

## Endpoints de IA Utilizados

- `/api/ai/classify` - Clasifica ticket al crearlo (automático)
- `/api/ai/suggest` - Genera respuesta sugerida (llamada manual desde panel)
- `/api/ai/summarize` - Resume el ticket (llamada manual desde panel)

## Seguridad RLS

Todas las tablas tienen Row Level Security configurado:
- **profiles**: Los usuarios ven su perfil, agents/admins ven todos
- **tickets**: Los usuarios ven sus tickets, agents/admins ven todos
- **comments**: Controlado por acceso a tickets
- **categories**: Lectura pública, escritura solo admin
- **notifications**: Cada usuario ve sus notificaciones
- **ai_logs**: Solo agents/admins pueden ver

## Próximos Pasos (Opcional)

1. Panel de Admin para gestión de categorías
2. Sistema de notificaciones en tiempo real
3. Reportes y métricas avanzadas
4. Integración con webhooks (n8n)
5. Búsqueda avanzada de tickets
6. Exportación de reportes

## Instrucciones de Uso

### Desarrollo Local
```bash
npm install
npm run dev
# Abre http://localhost:3000
```

### Deployment
```bash
# Deployment automático en Vercel
git push origin main
```

### Primeros Pasos
1. Registra un usuario como "user"
2. Registra un usuario como "agent" (requiere acción manual en Supabase)
3. El usuario crea un ticket
4. El agent ve el ticket con análisis de IA
5. El agent responde con sugerencia de IA
6. El usuario ve la respuesta en tiempo real

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_MODEL_ADVANCED=gpt-4o
```

## Notas Técnicas

- Autenticación: Supabase Auth con SSR
- Base de datos: PostgreSQL (Supabase)
- Framework: Next.js 15 con App Router
- UI: Tailwind CSS v4 + componentes custom
- IA: OpenAI con validación Zod
- Real-time: Supabase Realtime para comentarios

## Contacto y Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
