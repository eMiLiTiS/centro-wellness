-- ============================================================
-- Centro Wellness — Schema principal
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLAS
-- ============================================================

-- Profesionales
create table if not exists profesionales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Catálogo de servicios
create table if not exists servicios_catalogo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  duracion_default int, -- minutos
  activo boolean default true
);

-- Registros de servicios realizados
create table if not exists registros (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  cliente text not null,
  servicio_id uuid references servicios_catalogo(id) on delete set null,
  servicio_nombre text not null,
  duracion int not null,
  tarifa text not null,
  importe numeric(10,2) not null,
  pago text not null check (pago in ('Efectivo','Tarjeta','Bizum','Transferencia')),
  profesional_id uuid references profesionales(id) on delete set null,
  profesional_nombre text not null,
  mes text not null,  -- 'YYYY-MM'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ventas de producto
create table if not exists ventas (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  producto text not null,
  cantidad int not null default 1,
  importe_unitario numeric(10,2) not null,
  pago text not null check (pago in ('Efectivo','Tarjeta','Bizum','Transferencia')),
  profesional_id uuid references profesionales(id) on delete set null,
  profesional_nombre text not null,
  mes text not null,
  created_at timestamptz default now()
);

-- Tarjetas regalo vendidas
create table if not exists tarjetas_regalo (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  descripcion text not null,
  cantidad int not null default 1,
  importe_unitario numeric(10,2) not null,
  pago text not null check (pago in ('Efectivo','Tarjeta','Bizum','Transferencia')),
  profesional_id uuid references profesionales(id) on delete set null,
  profesional_nombre text not null,
  mes text not null,
  created_at timestamptz default now()
);

-- Horas disponibles por profesional y mes
create table if not exists horas_disponibles (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid references profesionales(id) on delete cascade,
  mes text not null,
  horas numeric(6,2) not null,
  unique(profesional_id, mes)
);

-- Análisis IA guardados
create table if not exists analisis_guardados (
  id uuid primary key default gen_random_uuid(),
  mes text not null,
  contenido text not null,
  autor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================================
-- TRIGGER: updated_at en registros
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists registros_updated_at on registros;
create trigger registros_updated_at
  before update on registros
  for each row execute function set_updated_at();

-- ============================================================
-- ÍNDICES de rendimiento
-- ============================================================

create index if not exists registros_mes_idx on registros(mes);
create index if not exists ventas_mes_idx on ventas(mes);
create index if not exists tarjetas_mes_idx on tarjetas_regalo(mes);
create index if not exists registros_profesional_idx on registros(profesional_id);
create index if not exists horas_profesional_mes_idx on horas_disponibles(profesional_id, mes);
