-- ============================================
-- FIX 1: Infinite recursion en profiles
-- ============================================
-- El problema: la policy "Admins/Agents view all profiles" hace un SELECT
-- FROM profiles dentro de una policy de profiles → recursión infinita.
-- La solución: usar auth.jwt() para leer el rol directamente del token JWT
-- (sin tocar la tabla profiles), o simplificar con una función SECURITY DEFINER.

-- Eliminar la policy problemática
DROP POLICY IF EXISTS "Admins/Agents view all profiles" ON profiles;

-- Reemplazarla con una versión sin recursión usando auth.jwt()
CREATE POLICY "Admins/Agents view all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('admin', 'agent')
    OR
    -- Alternativa: leer el rol con una función SECURITY DEFINER que saltea RLS
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

-- SOLUCIÓN MÁS ROBUSTA: usar una función auxiliar que lee el rol sin activar RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Ahora reemplazar TODAS las policies que hacen SELECT FROM profiles
-- para usar get_my_role() en su lugar (elimina la recursión completamente)

-- Profiles
DROP POLICY IF EXISTS "Admins/Agents view all profiles" ON profiles;
CREATE POLICY "Admins/Agents view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.get_my_role() IN ('admin', 'agent')
  );

-- Categories: admins pueden gestionar
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (public.get_my_role() = 'admin');

-- Tickets: agents/admins ven todos
DROP POLICY IF EXISTS "Agents/Admins view all tickets" ON tickets;
CREATE POLICY "Agents/Admins view all tickets" ON tickets
  FOR SELECT USING (
    public.get_my_role() IN ('agent', 'admin')
  );

-- Tickets: agents/admins pueden actualizar
DROP POLICY IF EXISTS "Agents/Admins update tickets" ON tickets;
CREATE POLICY "Agents/Admins update tickets" ON tickets
  FOR UPDATE USING (
    public.get_my_role() IN ('agent', 'admin')
  );

-- Comments: ver comentarios en tickets accesibles
DROP POLICY IF EXISTS "Users view comments on accessible tickets" ON comments;
CREATE POLICY "Users view comments on accessible tickets" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = comments.ticket_id
      AND (
        tickets.created_by = auth.uid()
        OR public.get_my_role() IN ('agent', 'admin')
      )
    )
  );

-- Comments: insertar comentarios en tickets accesibles
DROP POLICY IF EXISTS "Users insert comments on accessible tickets" ON comments;
CREATE POLICY "Users insert comments on accessible tickets" ON comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = comments.ticket_id
      AND (
        tickets.created_by = auth.uid()
        OR public.get_my_role() IN ('agent', 'admin')
      )
    )
  );

-- AI Logs: admins/agents
DROP POLICY IF EXISTS "Admins/Agents view AI logs" ON ai_logs;
CREATE POLICY "Admins/Agents view AI logs" ON ai_logs
  FOR SELECT USING (
    public.get_my_role() IN ('agent', 'admin')
  );


-- ============================================
-- FIX 2: Insertar categorías de ejemplo
-- ============================================
INSERT INTO categories (name, description) VALUES
  ('Problema Técnico',     'Errores, bugs o fallas técnicas en el sistema'),
  ('Acceso y Autenticación', 'Problemas para iniciar sesión, contraseñas o permisos'),
  ('Facturación y Pagos',  'Consultas sobre cobros, facturas o métodos de pago'),
  ('Solicitud de Función',  'Sugerencias para nuevas funcionalidades o mejoras'),
  ('Rendimiento',           'Lentitud, timeouts o problemas de velocidad'),
  ('Integración',           'Problemas con APIs externas o integraciones de terceros'),
  ('Seguridad',             'Reportes de vulnerabilidades o incidentes de seguridad'),
  ('Consulta General',      'Preguntas generales sobre el uso del sistema')
ON CONFLICT (name) DO NOTHING;
