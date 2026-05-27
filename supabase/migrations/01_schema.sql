-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'user');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_sentiment AS ENUM ('positive', 'neutral', 'negative', 'angry');

-- ============================================
-- TABLA: profiles (extiende auth.users de Supabase)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLA: categories
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLA: tickets
-- ============================================
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  sentiment ticket_sentiment,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ai_summary TEXT,
  ai_suggested_response TEXT,
  ai_risk_level TEXT,
  ai_classification JSONB,  -- { summary, classification, suggestions, riskLevel }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ============================================
-- TABLA: comments
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLA: notifications
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLA: ai_logs (observabilidad IA)
-- ============================================
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  model_version TEXT NOT NULL,
  response JSONB NOT NULL,
  latency_ms INTEGER,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_comments_ticket ON comments(ticket_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_ai_logs_ticket ON ai_logs(ticket_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Políticas: profiles
CREATE POLICY "Users view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins/Agents view all profiles" ON profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Users update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Políticas: categories (lectura para todos, escritura solo admin)
CREATE POLICY "Anyone can view categories" ON categories 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas: tickets (users ven los suyos, agents y admins ven todos)
CREATE POLICY "Users view own tickets" ON tickets 
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Agents/Admins view all tickets" ON tickets 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('agent', 'admin')
    )
  );

CREATE POLICY "Users insert own tickets" ON tickets 
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Agents/Admins update tickets" ON tickets 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('agent', 'admin')
    )
  );

-- Políticas: comments
CREATE POLICY "Users view comments on accessible tickets" ON comments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = comments.ticket_id 
      AND (tickets.created_by = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role IN ('agent', 'admin')
        )
      )
    )
  );

CREATE POLICY "Users insert comments on accessible tickets" ON comments 
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = comments.ticket_id 
      AND (tickets.created_by = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() AND role IN ('agent', 'admin')
        )
      )
    )
  );

-- Políticas: notifications
CREATE POLICY "Users manage own notifications" ON notifications 
  FOR ALL USING (user_id = auth.uid());

-- Políticas: ai_logs
CREATE POLICY "Admins/Agents view AI logs" ON ai_logs 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('agent', 'admin')
    )
  );

-- ============================================
-- TRIGGER: Crear perfil automático al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'user',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
