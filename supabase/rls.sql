-- ============================================================
-- Centro Wellness — Row Level Security (RLS)
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

-- Helper: extraer rol del JWT
-- Todos los usuarios tienen user_metadata.role = 'admin' | 'recepcion'

-- ============================================================
-- Activar RLS en todas las tablas
-- ============================================================

alter table profesionales enable row level security;
alter table servicios_catalogo enable row level security;
alter table registros enable row level security;
alter table ventas enable row level security;
alter table tarjetas_regalo enable row level security;
alter table horas_disponibles enable row level security;
alter table analisis_guardados enable row level security;

-- ============================================================
-- PROFESIONALES (solo lectura pública, escritura solo admin)
-- ============================================================

create policy "profesionales_select_all"
  on profesionales for select
  to authenticated
  using (true);

create policy "profesionales_admin_write"
  on profesionales for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- SERVICIOS_CATALOGO (solo lectura pública, escritura solo admin)
-- ============================================================

create policy "catalogo_select_all"
  on servicios_catalogo for select
  to authenticated
  using (true);

create policy "catalogo_admin_write"
  on servicios_catalogo for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- REGISTROS
-- Admin: acceso total
-- Recepción: SELECT libre, INSERT solo mes actual, sin UPDATE/DELETE
-- ============================================================

create policy "registros_select_all"
  on registros for select
  to authenticated
  using (true);

create policy "registros_admin_all"
  on registros for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "registros_recepcion_insert"
  on registros for insert
  to authenticated
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'recepcion'
    and mes = to_char(current_date, 'YYYY-MM')
  );

-- ============================================================
-- VENTAS
-- ============================================================

create policy "ventas_select_all"
  on ventas for select
  to authenticated
  using (true);

create policy "ventas_admin_all"
  on ventas for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "ventas_recepcion_insert"
  on ventas for insert
  to authenticated
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'recepcion'
    and mes = to_char(current_date, 'YYYY-MM')
  );

-- ============================================================
-- TARJETAS_REGALO
-- ============================================================

create policy "tarjetas_select_all"
  on tarjetas_regalo for select
  to authenticated
  using (true);

create policy "tarjetas_admin_all"
  on tarjetas_regalo for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "tarjetas_recepcion_insert"
  on tarjetas_regalo for insert
  to authenticated
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'recepcion'
    and mes = to_char(current_date, 'YYYY-MM')
  );

-- ============================================================
-- HORAS_DISPONIBLES (solo admin)
-- ============================================================

create policy "horas_select_all"
  on horas_disponibles for select
  to authenticated
  using (true);

create policy "horas_admin_write"
  on horas_disponibles for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- ANALISIS_GUARDADOS (solo admin puede insertar y ver)
-- ============================================================

create policy "analisis_admin_all"
  on analisis_guardados for all
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
