# Environment Setup Guide

## Step 1: Supabase Configuration (REQUIRED)

### Get Your Credentials:
1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** → **API**
4. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** (public) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Example:
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcxyz123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 2: OpenAI Configuration (REQUIRED)

### Get Your API Key:
1. Go to https://platform.openai.com/api-keys
2. Click **Create new secret key**
3. Copy the key immediately (you won't see it again)
4. Paste it into `.env.local`

### Verify Models Available:
The app uses these models:
- `gpt-4o` - For response suggestions (most capable)
- `gpt-4o-mini` - For classification, summarization, risk assessment (cheaper)

### Example:
```env
OPENAI_API_KEY=sk-proj-abc123xyz789...
```

### Cost Estimate:
- **Classify**: ~500 tokens × $0.00015/1K = ~$0.00008 per call
- **Summarize**: ~800 tokens × $0.00015/1K = ~$0.00012 per call
- **Suggest**: ~1500 tokens × $0.0002/1K = ~$0.0003 per call
- **Ticket creation with IA**: ~$0.0005-0.0008 total

---

## Step 3: N8N Configuration (OPTIONAL - for automations)

### Setup n8n:
If you want email notifications, Slack alerts, and daily reports:

1. **Self-hosted or n8n Cloud**:
   - Self-hosted: `https://your-server.com`
   - Cloud: https://app.n8n.cloud

2. **Create webhook endpoint**:
   - Go to your n8n instance
   - Create new workflow
   - Add HTTP trigger node
   - Copy the webhook URL

3. **Update `.env.local`**:
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-workflow-id
N8N_WEBHOOK_SECRET=your-webhook-secret-token
```

### Without N8N:
If you skip this, the app still works 100% - just without automated emails/Slack alerts.

---

## Step 4: Database Setup

Run the schema migration in Supabase:

1. Go to Supabase Console → **SQL Editor**
2. Create new query
3. Copy content from `supabase/migrations/01_schema.sql`
4. Execute the migration

This creates:
- `profiles` - User data with roles
- `tickets` - Support tickets
- `comments` - Ticket comments
- `categories` - Ticket categories
- `notifications` - User notifications
- `ai_logs` - AI call history for auditing

---

## Step 5: Verify Setup

Run locally:
```bash
npm run dev
```

Test these endpoints:
- **Login**: http://localhost:3000/login ✓ Should render
- **Register**: http://localhost:3000/register ✓ Should render
- **Auth**: Try creating account ✓ Should work with real Supabase

---

## Production Deployment (Vercel)

### 1. Push to GitHub:
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### 2. Deploy to Vercel:
1. Go to https://vercel.com
2. Import your GitHub repo
3. Set environment variables:
   - Add all keys from `.env.local` in **Settings → Environment Variables**
   - Mark `NEXT_PUBLIC_*` keys as public
   - Keep `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` as private

### 3. Deploy:
```bash
vercel
```

---

## Troubleshooting

### Error: "Invalid Supabase credentials"
- ✓ Check URL format: `https://xxxxx.supabase.co`
- ✓ Verify Anon Key is copied correctly
- ✓ Check for extra spaces in `.env.local`

### Error: "OpenAI API key invalid"
- ✓ Ensure key starts with `sk-proj-`
- ✓ Check your API key hasn't been revoked
- ✓ Verify account has credits/quota

### Error: "Cannot connect to database"
- ✓ Verify Supabase project is running
- ✓ Check network connectivity
- ✓ Ensure service role key is in `.env.local` (not just anon key)

### Hydration mismatch warning
- This is a known Tailwind v4 warning and doesn't affect functionality
- Can be safely ignored

---

## Security Notes

- **Never commit `.env.local`** to GitHub (already in `.gitignore`)
- **Rotate OpenAI key** if exposed
- **Use strong passwords** in Supabase
- **Enable RLS** on all tables (already done in migrations)
- **Use Service Role Key only on backend** (never in frontend code)

---

## Next Steps

1. ✓ Fill in `.env.local` with your credentials
2. ✓ Run database migration in Supabase
3. ✓ Test locally with `npm run dev`
4. ✓ Deploy to Vercel
5. ✓ (Optional) Configure n8n for automations

All set! 🚀
