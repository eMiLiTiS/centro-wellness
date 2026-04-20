-- ============================================================
-- Centro Wellness — Datos placeholder de inicio
-- Ejecutar DESPUÉS de schema.sql y rls.sql
-- ============================================================

-- Profesionales (placeholder)
insert into profesionales (nombre, activo) values
  ('Ana García', true),
  ('María López', true)
on conflict do nothing;

-- Catálogo de servicios (placeholder — ~5 ítems para empezar)
-- El catálogo completo (~130 servicios) se cargará desde la pantalla de Ajustes
insert into servicios_catalogo (nombre, duracion_default, activo) values
  ('Masaje relajante 60 min', 60, true),
  ('Masaje relajante 90 min', 90, true),
  ('Facial hidratante', 60, true),
  ('Depilación piernas completas', 45, true),
  ('Manicura', 45, true)
on conflict do nothing;

-- ============================================================
-- INSTRUCCIONES PARA CREAR USUARIOS
-- No se puede insertar usuarios desde SQL (usa la UI de Supabase Auth)
--
-- 1. Ve a Supabase > Authentication > Users > "Add user"
-- 2. Email: admin@centrowellness.es  Password: (elige una)
--    Metadata: { "role": "admin" }
--
-- 3. (Opcional) Email: recepcion@centrowellness.es
--    Metadata: { "role": "recepcion" }
--
-- Para añadir metadata desde SQL Editor (solo si el usuario ya existe):
--   update auth.users
--   set raw_user_meta_data = '{"role": "admin"}'
--   where email = 'admin@centrowellness.es';
-- ============================================================
