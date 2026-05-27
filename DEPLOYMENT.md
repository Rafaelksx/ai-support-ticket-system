# Guía de Deployment

Instrucciones para deployar la aplicación a producción en Vercel + Supabase.

## Prerequisitos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com)
- Repositorio en GitHub
- Dominio personalizado (opcional)

## Paso 1: Preparar Supabase Production

### 1.1 Crear Proyecto en Supabase

1. Ve a https://supabase.com/dashboard
2. Click **New Project**
3. Nombre: "aura-support-prod"
4. Region: Elige la más cercana a tus usuarios
5. Database password: Guarda en lugar seguro
6. Click **Create new project**

### 1.2 Ejecutar Migraciones

1. Abre **SQL Editor** en Supabase
2. Click **New Query**
3. Copia todo el contenido de `supabase/migrations/01_schema.sql`
4. Pégalo en el editor
5. Click **Run**

### 1.3 Verificar RLS Está Habilitado

1. Ve a **Authentication** → **Policies**
2. Verifica que tienes políticas RLS para:
   - `profiles`
   - `tickets`
   - `comments`
   - `notifications`

Si no están, ejecuta las políticas del archivo SQL.

### 1.4 Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...`
   - **Service role key**: `eyJhbG...` (MANTÉN SECRETO)

## Paso 2: Configurar GitHub

### 2.1 Pushear Código

```bash
git init
git add .
git commit -m "Initial commit: AI Support Ticket System"
git branch -M main
git remote add origin https://github.com/yourusername/ai-support-ticket-system.git
git push -u origin main
```

### 2.2 Crear `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm install
      
      - name: Run type check
        run: npx tsc --noEmit
      
      - name: Run lint
        run: npm run lint --max-warnings=0
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Paso 3: Configurar Vercel

### 3.1 Conectar Repositorio

1. Ve a https://vercel.com/new
2. Selecciona tu repositorio de GitHub
3. Click **Import**

### 3.2 Configurar Variables de Entorno

En **Environment Variables**, agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG... (SECRETO)
OPENAI_API_KEY=sk-...
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
N8N_WEBHOOK_SECRET=your-secret
```

**Nota**: Las variables que comienzan con `NEXT_PUBLIC_` se exponen en el cliente. NO incluyas claves secretas ahí.

### 3.3 Configurar Dominio

1. Ve a **Settings** → **Domains**
2. Click **Add**
3. Ingresa tu dominio personalizado (ej: support.mycompany.com)
4. Sigue instrucciones DNS

### 3.4 Deploy

1. Click **Deploy**
2. Vercel construirá y deployará automáticamente
3. Espera a que muestre "Ready"

---

## Paso 4: Configurar Supabase para Producción

### 4.1 Habilitar SMTP para Emails

1. Ve a **Auth** → **Email Templates**
2. Habilita "Custom SMTP"
3. Configura credenciales SMTP (ej: Gmail, SendGrid)

### 4.2 Configurar Email Sender

1. Ve a **Settings** → **Email**
2. Establece:
   - **From Address**: support@mycompany.com
   - **From Name**: AuraSupport Team

### 4.3 Habilitar MFA (Opcional)

1. Ve a **Auth** → **Security**
2. Habilita "Multi-Factor Authentication"

### 4.4 Configurar Rate Limiting

1. Ve a **Auth** → **Rate Limiting**
2. Habilita para proteger contra brute force:
   - Sign up: 10 requests/hour
   - Sign in: 15 requests/hour
   - Token refresh: 30 requests/hour

### 4.5 Backups Automáticos

1. Ve a **Settings** → **Backups**
2. Habilita "Automated Daily Backups"
3. Elige retención (30 días recomendado)

---

## Paso 5: Configurar Monitoreo

### 5.1 Logging en Vercel

1. Ve a **Logs** en Vercel
2. Configura alertas para:
   - Build failures
   - Runtime errors
   - High CPU/Memory usage

### 5.2 Supabase Monitoring

1. Ve a **Database** → **Monitoring**
2. Revisa:
   - Query performance
   - Connection count
   - Storage usage

### 5.3 Alertas de Errores

Integra con Sentry (opcional):

1. Crea cuenta en https://sentry.io
2. Crea nuevo proyecto (Next.js)
3. En `src/instrumentation.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1,
  environment: process.env.NODE_ENV,
});
```

4. Agrega `NEXT_PUBLIC_SENTRY_DSN` a Vercel

---

## Pre-Deployment Checklist

- [ ] Código está en GitHub
- [ ] Todas las pruebas pasan (`npm run lint`, TypeScript check)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos migrada en Supabase
- [ ] RLS políticas verificadas
- [ ] Dominio configurado (si aplica)
- [ ] HTTPS habilitado (Vercel lo hace automáticamente)
- [ ] Backups automáticos en Supabase
- [ ] Email SMTP configurado
- [ ] OpenAI API key válida
- [ ] n8n webhooks configurados
- [ ] Plan de Vercel es "Pro" o superior (si necesitas más recursos)

---

## Post-Deployment Checklist

- [ ] URL del sitio es accesible
- [ ] Login/Register funcionan
- [ ] Crear ticket funciona
- [ ] IA endpoints responden (classify, suggest, summarize)
- [ ] Emails se envían (verificar spam)
- [ ] Webhooks de n8n se disparan
- [ ] Notificaciones aparecen en tiempo real
- [ ] Sin errores en Vercel logs
- [ ] Performance: página carga en <2s
- [ ] Móvil se ve bien (test en DevTools)

---

## Monitoreo Continuo

### Métricas a Seguir

1. **Performance**
   - Page load time
   - Time to interactive (TTI)
   - Core Web Vitals

2. **Errores**
   - 5xx errors
   - API timeouts
   - Database connection issues

3. **Uso**
   - DAU (Daily Active Users)
   - Tickets creados por día
   - API requests per minute

### Alertas Recomendadas

```
- Build failure → Notificar al equipo
- >100 errores/hora → Page
- Uptime <99% en 24h → Alert
- Disk space >80% → Escalate
- Response time >2s → Investigate
```

---

## Escalamiento Horizontal

Cuando la aplicación crezca:

### 1. Escalar Base de Datos

```sql
-- En Supabase, en Settings → Compute
-- Cambia a un plan más grande (>4GB RAM)
```

### 2. Usar Vercel Enterprise

- Edge Functions para menor latencia
- Automatic deployments con git integration
- Analytics avanzado

### 3. Cache CDN

```typescript
// En next.config.ts
export default {
  onDemandISR: {
    maxMemoryUsageSeconds: 60,
  },
};
```

### 4. Database Connection Pooling

En Supabase, habilita **Supavisor** (connection pooler):
1. Settings → Database → Connection pooling
2. Pool mode: Transaction
3. Pool size: 20 connections

---

## Rollback Plan

Si algo sale mal:

### 1. Rollback Rápido

```bash
# En Vercel, ir a Deployments
# Seleccionar deployment previo
# Click "Redeploy"
```

### 2. Rollback Database

```bash
# En Supabase, ir a Backups
# Restore snapshot anterior
# (Nota: esto puede causar pérdida de datos, úsalo como último recurso)
```

### 3. Notificar Usuarios

```
Si el servicio está down >15 min:
1. Actualizar página de status
2. Enviar email a usuarios premium
3. Post en redes sociales
```

---

## Disaster Recovery

### Backup Strategy

- Supabase: Daily automatic backups (30 días)
- Database exports: Weekly to S3
- Code: Always on GitHub

### Recovery RTO/RPO

- **RTO (Recovery Time Objective)**: 1 hora máximo
- **RPO (Recovery Point Objective)**: 24 horas máximo

### Runbook

```markdown
## Si Supabase está down:

1. Verificar status: https://status.supabase.com
2. Esperar 15 minutos (generalmente se recupera)
3. Si persiste >1 hora:
   - Restaurar desde backup
   - Notificar usuarios
   - Post-mortem en 24h

## Si Vercel está down:

1. Verificar status: https://www.vercelstatus.com
2. Si nosotros: verificar logs en Vercel
3. Rollback a deployment anterior
```

---

## Seguridad en Producción

### CORS Configuration

```typescript
// next.config.ts
headers: [
  {
    source: '/api/:path*',
    headers: [
      {
        key: 'Access-Control-Allow-Origin',
        value: process.env.NEXT_PUBLIC_APP_URL,
      },
    ],
  },
];
```

### Rate Limiting

```typescript
// lib/api-helpers.ts - ya implementado
checkRateLimit(key, maxRequests, windowMs)
```

### Secrets Rotation

Cada 90 días:
- Regenera API keys de OpenAI
- Rota Database password en Supabase
- Cambia N8N_WEBHOOK_SECRET

### Compliance

- GDPR: Implementa derecho al olvido
- CCPA: Transparencia en recolección de datos
- SOC 2: Auditoría anual recomendada

---

## Troubleshooting Deployment

| Problema | Solución |
|----------|----------|
| "Build failed: Module not found" | `npm install`, verifica imports |
| "Vercel can't connect to Supabase" | Verifica NEXT_PUBLIC_SUPABASE_URL |
| "Database connection refused" | Asegúrate IP de Vercel está whitelisted |
| "Emails no se envían" | Verifica SMTP en Supabase settings |
| "API 500 errors" | Revisa logs en Vercel, OpenAI key válida |
| "Lento en producción" | Habilita caching en Vercel, escala DB |

---

## Support

Si tienes problemas:

1. Revisa [Vercel Docs](https://vercel.com/docs)
2. Revisa [Supabase Docs](https://supabase.com/docs)
3. Abre issue en GitHub
4. Contacta Vercel support (si es plan Pro/Enterprise)
