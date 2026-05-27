# Guía de Configuración n8n

Esta guía te ayuda a configurar los workflows de n8n para automatización de soporte.

## Requisitos Previos

- Cuenta en [n8n Cloud](https://app.n8n.cloud) o instancia self-hosted
- Credenciales de:
  - Gmail/SMTP para envío de emails
  - Slack workspace y bot token
  - URL de webhook de tu aplicación

## Instalación de Workflows

### Paso 1: Copiar URL de Webhook

1. Anota tu URL de aplicación en Vercel (ej: `https://my-app.vercel.app`)
2. Tu webhook estará en: `https://my-app.vercel.app/api/webhooks/n8n`

### Paso 2: Importar Workflows

En n8n:
1. Ve a **Workflows** → **Import Workflow**
2. Selecciona los JSONs de `n8n/workflows/`:
   - `ticket-created-email.json`
   - `high-priority-slack-alert.json`
   - `daily-summary-report.json`
3. Click **Import**

### Paso 3: Configurar Credenciales

#### A. Email (Gmail)

1. En n8n, ve a **Credentials** → **New**
2. Busca "Gmail"
3. Completa:
   - **Email**: tu email de Gmail
   - **Password**: contraseña de aplicación (no la contraseña normal)
     - Habilita 2FA en tu Google Account
     - Genera app password: https://myaccount.google.com/apppasswords
4. Click **Save**

**Alternativa: SMTP Genérico**

```
Host: smtp.gmail.com
Port: 587
User: tu-email@gmail.com
Password: app-password
Encrypt: STARTTLS
```

#### B. Slack

1. Ve a **Credentials** → **New**
2. Busca "Slack"
3. Selecciona "OAuth2"
4. Click **Connect my account**
5. En tu Slack workspace:
   - Ve a **api.slack.com** → **Your Apps** → **Create New App**
   - Nombre: "AuraSupport Notifications"
   - Workspace: selecciona el tuyo
6. En **OAuth & Permissions**:
   - **Scopes**: agrega `chat:write`
   - Copia **Bot User OAuth Token**
7. En n8n, pega el token
8. Click **Save**

#### C. HTTP Webhook (para recibir eventos)

Este no requiere credenciales extra. n8n genera automáticamente el URL del webhook.

### Paso 4: Configurar Nodes en Cada Workflow

#### Workflow: `ticket-created-email.json`

Nodo **"Recibir Webhook"**:
- Method: `POST`
- Path: `/ticket-created` (n8n lo convierte a URL completo)

Nodo **"Enviar Email"**:
- **Email From**: tu-email@gmail.com
- **Email To**: `{{ $json.user_email }}`
- **Subject**: "Tu ticket ha sido creado - #{{ $json.ticket_id }}"
- **Text**: Usa template con variables:
  ```
  Hola {{ $json.user_name }},

  Tu ticket ha sido creado exitosamente.

  ID: {{ $json.ticket_id }}
  Título: {{ $json.title }}
  Prioridad: {{ $json.priority }}

  Puedes seguir el estado en: https://your-app.com/tickets/{{ $json.ticket_id }}

  Soporte AuraSupport
  ```

#### Workflow: `high-priority-slack-alert.json`

Nodo **"Recibir Webhook"**:
- Method: `POST`
- Path: `/high-priority-alert`

Nodo **"Enviar Mensaje Slack"**:
- **Channel**: `#support-alerts` (o el que prefieras)
- **Text**: Template formateado:
  ```
  🚨 ALERTA: Ticket de Alta Prioridad

  Título: {{ $json.title }}
  Prioridad: {{ $json.priority }}
  Sentimiento: {{ $json.sentiment }}
  Resumen IA: {{ $json.ai_summary }}

  Acción: <https://your-app.com/tickets/{{ $json.ticket_id }}|Ir al ticket>
  ```

#### Workflow: `daily-summary-report.json`

Nodo **"Schedule Trigger"**:
- **Trigger Type**: Cron
- **Cron Expression**: `0 8 * * *` (8am cada día)

Nodos **"Query Database"** (simulado):
- En producción, conectarías directamente a Supabase
- O usarías HTTP Request para llamar endpoints de tu API

Nodo **"Enviar Email"**:
- **Email To**: manager@company.com
- **Subject**: "Reporte Diario de Soporte - {{ $now.toFormat('yyyy-MM-dd') }}"
- **Text/HTML**: Tabla con métricas

### Paso 5: Activar Webhooks en tu API

En `src/app/api/webhooks/n8n/route.ts`, asegúrate de que:

```typescript
// Verifica secreto del webhook
const secret = request.headers.get('x-webhook-secret');
if (secret !== process.env.N8N_WEBHOOK_SECRET) {
  return errorResponse('Invalid signature', 'UNAUTHORIZED', 401);
}

// Procesa evento
switch (body.event) {
  case 'ticket_created':
    // Envía webhook a n8n
    await fetch(`${process.env.N8N_WEBHOOK_URL}/ticket-created`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    break;
  // ... más eventos
}
```

### Paso 6: Trigger Webhooks desde tu Aplicación

En `src/app/api/tickets/route.ts` (al crear ticket):

```typescript
// Dispatch webhook event after ticket creation
fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/n8n`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
  },
  body: JSON.stringify({
    event: 'ticket_created',
    ticket_id: ticket.id,
    title: ticket.title,
    user_email: user_email,
    user_name: user_name,
    priority: ticket.priority,
  }),
});
```

### Paso 7: Testing

En n8n:
1. Abre cada workflow
2. Click **"Test Workflow"**
3. En "Execute Workflow", selecciona **"From URL"**
4. Pega un evento de ejemplo:

```json
{
  "event": "ticket_created",
  "ticket_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Test Ticket",
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "priority": "high"
}
```

5. Click **"Execute"** y verifica que el email/mensaje se envía

---

## Eventos Disponibles

Tu API puede disparar estos eventos a n8n:

### `ticket_created`

Enviado cuando un usuario crea un ticket.

```json
{
  "event": "ticket_created",
  "ticket_id": "uuid",
  "title": "string",
  "description": "string",
  "user_email": "string",
  "user_name": "string",
  "priority": "low|medium|high|critical",
  "category": "string"
}
```

### `ticket_priority_high`

Enviado cuando un ticket cambia a prioridad alta/crítica.

```json
{
  "event": "ticket_priority_high",
  "ticket_id": "uuid",
  "title": "string",
  "priority": "high|critical",
  "assigned_to": "string (agent name)",
  "ai_summary": "string"
}
```

### `ticket_resolved`

Enviado cuando un ticket es marcado como resuelto.

```json
{
  "event": "ticket_resolved",
  "ticket_id": "uuid",
  "title": "string",
  "resolved_by": "string (agent name)",
  "time_to_resolve_hours": "number"
}
```

---

## Troubleshooting n8n

| Problema | Solución |
|----------|----------|
| "Webhook URL not reachable" | Verifica que tu app está desplegada en Vercel |
| "SMTP Error" | Usa app password en Gmail, no contraseña normal |
| "Slack auth failed" | Regenera bot token en Slack API dashboard |
| "Workflow not triggering" | Verifica que `X-Webhook-Secret` matches en API |
| Emails van a spam | Usa SPF/DKIM, configura "From" con dominio propio |

---

## Ejemplo: Workflow de Ticket Creado

```
┌─────────────────────────┐
│  Recibir Webhook POST   │
│  /ticket-created        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Parsear JSON           │
│  (body del webhook)     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Filtro: is_priority    │
│  == 'high'              │
└────────────┬────────────┘
        ✓    │    ✗
        │    └──→ (fin)
        │
        ▼
┌─────────────────────────┐
│  Enviar Email al User   │
│  (confirmation)         │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Enviar Slack Alert     │
│  (#support-alerts)      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Fin                    │
└─────────────────────────┘
```

---

## Monitoring

Para monitorear webhooks:

1. En n8n, ve a **Execution History**
2. Filtra por workflow
3. Revisa logs de cada ejecución
4. Si hay errores, mira **Logs** para debugging

---

## Seguridad

### Proteger Webhooks

1. Siempre usa `X-Webhook-Secret` en headers
2. Valida que el secret coincida en tu API
3. Usa HTTPS (Vercel lo proporciona automáticamente)
4. En producción, cambia `N8N_WEBHOOK_SECRET` regularmente

### Credenciales

- Nunca hardcodees credenciales en los JSONs
- Usa el sistema de credenciales de n8n
- Rota contraseñas cada 3-6 meses

---

## Próximos Pasos

- Agregar más workflows (ej: customer satisfaction survey)
- Integrar con Slack threads para mejor comunicación
- Crear alertas personalizadas por equipo
- Implementar reportes semanales en lugar de diarios
