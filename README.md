# AI Support Ticket System (AuraSupport)

Plataforma de soporte técnico inteligente con autenticación, gestión de tickets y asistencia de IA para priorización, resumen automático y sugerencias de respuesta. Arquitectura empresarial con tres roles: **Admin**, **Agent** y **User**.

## Características Principales

- ✅ **Autenticación Segura**: Supabase Auth con email/password y RLS
- ✅ **Gestión de Tickets CRUD**: Crear, listar, editar y eliminar con filtros
- ✅ **IA Integrada**: Clasificación automática, resumen y sugerencias de respuesta
- ✅ **Sistema de Roles**: User, Agent, Admin con permisos granulares
- ✅ **Comentarios en Tiempo Real**: Supabase Realtime para actualizaciones instantáneas
- ✅ **Notificaciones**: Sistema de notificaciones para usuarios y agentes
- ✅ **Webhooks n8n**: Automatización de emails, alertas Slack, reportes diarios
- ✅ **API Completa**: Endpoints documentados para todas las operaciones
- ✅ **Observable**: Logging de IA en tabla `ai_logs` para auditoría

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) + Tailwind CSS v4 |
| Backend / Auth / DB | Supabase (PostgreSQL + RLS + Realtime) |
| IA | OpenAI API (GPT-4o / GPT-4o-mini) |
| Automatización | n8n (webhooks y workflows) |
| Deploy | Vercel + Supabase |
| Tipos | TypeScript + Zod |

## Instalación Rápida

### 1. Clonar y Configurar

```bash
git clone https://github.com/yourusername/ai-support-ticket-system.git
cd ai-support-ticket-system
npm install
cp .env.example .env.local
```

### 2. Configurar `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_api_key

# n8n (opcional)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
N8N_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Setup Base de Datos

En tu consola de Supabase, ejecuta el contenido de `supabase/migrations/01_schema.sql` o usa Supabase CLI:

```bash
supabase migration up
```

### 4. Ejecutar Localmente

```bash
npm run dev
```

App disponible en `http://localhost:3000`

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/                    # Route group autenticación
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/               # Route group dashboard
│   │   ├── layout.tsx             # NavBar + Sidebar
│   │   ├── page.tsx               # Dashboard con métricas
│   │   ├── tickets/
│   │   │   ├── page.tsx           # Lista de tickets
│   │   │   ├── new/page.tsx       # Crear ticket
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Detalle con comentarios
│   │   │       └── edit/page.tsx  # Editar ticket (agent)
│   │   ├── admin/
│   │   │   ├── users/page.tsx     # Gestión de usuarios
│   │   │   └── categories/page.tsx
│   │   └── notifications/page.tsx # Centro de notificaciones
│   ├── api/
│   │   ├── tickets/               # CRUD tickets
│   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts       # GET, PATCH, DELETE
│   │   │       └── comments/
│   │   │           └── route.ts   # GET, POST comentarios
│   │   ├── ai/                    # Endpoints de IA
│   │   │   ├── classify/route.ts  # Clasificar prioridad
│   │   │   ├── summarize/route.ts # Resumir ticket
│   │   │   ├── suggest/route.ts   # Sugerir respuesta
│   │   │   ├── risk/route.ts      # Evaluar riesgo
│   │   │   └── next-action/route.ts # Próxima acción
│   │   ├── users/                 # Gestión de usuarios
│   │   │   ├── route.ts           # GET lista
│   │   │   └── [id]/route.ts      # PATCH rol
│   │   ├── notifications/         # Notificaciones
│   │   │   ├── route.ts           # GET lista
│   │   │   └── [id]/route.ts      # PATCH marcar como leída
│   │   └── webhooks/
│   │       └── n8n/route.ts       # Webhook receptor
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Root redirect
│   └── globals.css                # Tailwind + tokens
├── components/
│   ├── ui/                        # Componentes base
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── input.tsx
│   ├── navbar.tsx                 # Barra superior
│   ├── sidebar.tsx                # Navegación lateral
│   ├── mobile-menu.tsx            # Menú móvil
│   ├── metric-card.tsx            # Tarjeta de métrica
│   ├── comment-section.tsx        # Sistema de comentarios
│   └── ai-assistant.tsx           # Panel IA (suggest, summarize)
├── hooks/
│   ├── useTickets.ts              # Hook para tickets
│   ├── useNotifications.ts        # Hook para notificaciones
│   └── useRealtime.ts             # Hook para Realtime
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Cliente navegador
│   │   ├── server.ts              # Cliente servidor
│   │   └── middleware.ts          # Auth middleware
│   ├── ai/
│   │   ├── openai.ts              # Config OpenAI
│   │   ├── prompts.ts             # Prompts versionados
│   │   ├── schemas.ts             # Validación Zod
│   │   └── logger.ts              # Logger de IA
│   ├── api-helpers.ts             # Funciones comunes API
│   ├── constants.ts               # Configuración global
│   └── utils.ts                   # Utilidades
├── types/
│   ├── database.ts                # Tipos del esquema
│   ├── ticket.ts                  # Tipos extendidos
│   ├── user.ts                    # Tipos de usuario
│   └── ai.ts                      # Tipos de IA
└── middleware.ts                  # Next.js middleware

supabase/
├── migrations/
│   └── 01_schema.sql              # Schema BD completo
└── seed.sql                       # Datos de prueba

n8n/
└── workflows/                     # JSONs de n8n
    ├── ticket-created-email.json
    ├── high-priority-slack-alert.json
    └── daily-summary-report.json
```

---

## Endpoints API

### Tickets

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/tickets` | Listar tickets (filtrable) | Todos |
| POST | `/api/tickets` | Crear ticket | Todos |
| GET | `/api/tickets/[id]` | Detalle de ticket | Todos |
| PATCH | `/api/tickets/[id]` | Actualizar ticket | Agent, Admin |
| DELETE | `/api/tickets/[id]` | Eliminar ticket | Admin |
| GET | `/api/tickets/[id]/comments` | Listar comentarios | Todos |
| POST | `/api/tickets/[id]/comments` | Agregar comentario | Todos |

**Query params para GET `/api/tickets`:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `status` (open, in_progress, resolved, closed)
- `priority` (low, medium, high, critical)
- `assigned_to` (uuid o "unassigned")
- `category_id` (uuid)
- `search` (busca en título y descripción)
- `sort` (default: created_at)
- `order` (asc, desc)

### IA

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/api/ai/classify` | Clasificar prioridad/sentimiento | Agent, Admin |
| POST | `/api/ai/summarize` | Resumir ticket | Agent, Admin |
| POST | `/api/ai/suggest` | Sugerir respuesta | Agent, Admin |
| POST | `/api/ai/risk` | Evaluar riesgo | Agent, Admin |
| POST | `/api/ai/next-action` | Recomendar siguiente acción | Agent, Admin |

### Usuarios

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users` | Listar usuarios | Admin |
| PATCH | `/api/users/[id]` | Cambiar rol de usuario | Admin |

### Notificaciones

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/notifications` | Obtener notificaciones | Todos |
| PATCH | `/api/notifications/[id]` | Marcar como leída | Todos |

### Webhooks

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/webhooks/n8n` | Recibir eventos de n8n |

---

## Flujos de Usuarios

### User (Cliente)

1. **Registro**: Crea cuenta con email/password
2. **Crear Ticket**: Reporta incidente con título + descripción + categoría
3. **Ver Mis Tickets**: Lista filtrada de sus propios tickets
4. **Seguimiento**: Ve comentarios de agentes y estado en tiempo real
5. **Comentar**: Comunica con el agente sobre su ticket

### Agent (Soporte)

1. **Login**: Acceso con credenciales
2. **Ver Cola**: Todos los tickets, filtrados por estado/prioridad
3. **Asignar**: Se asigna tickets a sí mismo o a otros agentes
4. **Atender**: Lee ticket, ve comentarios, usa panel IA
5. **Usar IA**: Obtiene resumen, sugerencias de respuesta, evaluación de riesgo
6. **Responder**: Agrega comentario al ticket
7. **Actualizar Estado**: Marca como en progreso → resuelto → cerrado
8. **Ver Métricas**: Dashboard de performance personal

### Admin (Gerente)

1. **Acceso Completo**: Todas las funcionalidades de agent + más
2. **Gestionar Usuarios**: Ver/cambiar roles (user → agent → admin)
3. **Gestionar Categorías**: CRUD de categorías de tickets
4. **Ver Métricas Globales**: Análisis de tickets, distribución por agente, SLA
5. **Auditoría**: Ver logs de IA, historial de cambios

---

## Autenticación y Seguridad

### Row Level Security (RLS)

Todos los datos están protegidos a nivel de base de datos:

```sql
-- Tickets: users ven los suyos; agents/admins ven todos
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own" ON tickets FOR SELECT 
  USING (created_by = auth.uid());
CREATE POLICY "Agents view all" ON tickets FOR SELECT 
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('agent', 'admin')));

-- Comments: accesibles si el usuario puede ver el ticket
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View if ticket visible" ON comments FOR SELECT 
  USING (EXISTS (SELECT 1 FROM tickets WHERE id = comments.ticket_id AND ...));

-- Notifications: solo el usuario destinatario
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own" ON notifications FOR SELECT 
  USING (user_id = auth.uid());
```

### Permisos por Rol

| Permiso | User | Agent | Admin |
|---------|------|-------|-------|
| Ver propios tickets | ✓ | ✓ | ✓ |
| Ver todos los tickets | ✗ | ✓ | ✓ |
| Crear ticket | ✓ | ✓ | ✓ |
| Actualizar ticket | ✗ | ✓ | ✓ |
| Eliminar ticket | ✗ | ✗ | ✓ |
| Asignar ticket | ✗ | ✓ | ✓ |
| Acceso IA | ✗ | ✓ | ✓ |
| Gestionar usuarios | ✗ | ✗ | ✓ |
| Ver métricas | ✗ | ✓ | ✓ |

---

## IA Integration

### Endpoints y Funcionalidades

#### 1. Clasificar (`POST /api/ai/classify`)
Detecta automáticamente:
- **Prioridad**: low, medium, high, critical
- **Sentimiento**: positive, neutral, negative, angry
- **Categoría sugerida**: basada en contenido
- **Confianza**: score 0-1

**Request:**
```json
{
  "ticketId": "uuid",
  "title": "Mi servidor está caído",
  "description": "No puedo acceder a mi aplicación...",
  "category": "Infraestructura"
}
```

#### 2. Resumir (`POST /api/ai/summarize`)
Genera resumen breve del ticket:
- Problema principal
- Intentos previos
- Estado actual

#### 3. Sugerir Respuesta (`POST /api/ai/suggest`)
Genera respuesta profesional para el agente:
- **Human-in-the-loop**: Agente revisa ANTES de enviar
- **Nunca automático**: Requiere confirmación manual
- Tono profesional y empático

#### 4. Evaluar Riesgo (`POST /api/ai/risk`)
Calcula puntuación de riesgo:
- Factores de riesgo identificados
- Recomendación (monitor, prioritize, escalate)
- Justificación

#### 5. Siguiente Acción (`POST /api/ai/next-action`)
Recomienda acción contextual:
- assign_to_specialist
- request_more_info
- escalate
- close
- send_update
- provide_workaround

### Logging IA

Todas las invocaciones se registran en tabla `ai_logs`:

```javascript
{
  ticket_id: "uuid",
  prompt: "texto completo enviado",
  model_version: "gpt-4o-2024-08-06",
  response: { ...JSON },
  latency_ms: 250,
  token_count: 450
}
```

---

## Automatización n8n

### Workflows Incluidos

#### 1. Email al Crear Ticket
- Confirmación al usuario
- Notificación al agente asignado
- Resumen del ticket en el email

#### 2. Alerta Slack en Prioridad Alta
- Trigger: `priority = 'high' | 'critical'`
- Mensaje formateado con resumen IA
- Canal: `#support-alerts`

#### 3. Reporte Diario
- Ejecución: 8am todos los días
- Métricas: tickets abiertos, resueltos, por agente
- Tiempo promedio de resolución
- SLA compliance

### Configurar n8n

1. Importa JSONs desde `n8n/workflows/`
2. Configura credenciales:
   - Email (Gmail/SMTP)
   - Slack (Bot Token)
   - Webhooks URL
3. Activa workflows

Ver [N8N_SETUP.md](N8N_SETUP.md) para guía detallada.

---

## Desarrollo

### Comandos

```bash
npm run dev       # Servidor desarrollo
npm run build     # Build para producción
npm run start     # Ejecutar build
npm run lint      # ESLint
npm run type-check # TypeScript check
```

### Agregar Componente UI

```tsx
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Título</h2>
      <Button>Acción</Button>
    </Card>
  );
}
```

### Crear Nuevo Endpoint

```typescript
import { NextRequest } from 'next/server';
import { getAuthUser, errorResponse, successResponse } from '@/lib/api-helpers';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return errorResponse('No autenticado', 'UNAUTHORIZED', 401);
  
  // Tu lógica aquí
  return successResponse({ data: 'success' });
}
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| JWT expired | Refresh page o logout/login |
| RLS policy violation | Verifica rol en `profiles` y permisos |
| API 401 | Verifica sesión Supabase auth |
| AI error | Revisa OPENAI_API_KEY en .env.local |
| Realtime no funciona | Asegúrate que Realtime está habilitado en Supabase |

---

## Roadmap

- [ ] Autenticación OAuth (Google, GitHub)
- [ ] Análisis de satisfacción del cliente
- [ ] Búsqueda avanzada con ElasticSearch
- [ ] Exportación de reportes (PDF)
- [ ] Mobile app nativa (React Native)
- [ ] Integración Zendesk/Jira
- [ ] Dark mode
- [ ] Soporte multiidioma

---

## Licencia

MIT

## Contacto

Para bugs o sugerencias: Abre un issue en GitHub
