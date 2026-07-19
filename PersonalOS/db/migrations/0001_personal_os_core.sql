-- Personal OS core schema (blueprint Part 3, Step 3).
-- Run in the Supabase SQL Editor of the EXISTING LifeOS project.
-- Table names below are new and do not collide with the existing
-- public.app_state table used by the old LifeOS dashboard.

create extension if not exists vector;

create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  name text not null,
  kind text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.raw_captures (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  source text not null,
  raw_text text,
  audio_url text,
  classification jsonb,
  llm_source text,
  routed_to text,
  routed_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  title text not null,
  description text,
  urgency text not null default 'someday' check (urgency in ('today', 'this_week', 'this_month', 'someday')),
  key boolean not null default false,
  priority_score numeric not null default 0,
  time_estimate_min integer,
  tags text[] not null default '{}',
  due_date date,
  owner text,
  entity_id uuid references public.entities(id),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  log_date date not null,
  notes text,
  mood text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.memory_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  source_type text not null,
  source_id uuid,
  text text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists memory_chunks_embedding_idx
  on public.memory_chunks using ivfflat (embedding vector_cosine_ops);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'default',
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.entities enable row level security;
alter table public.raw_captures enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_logs enable row level security;
alter table public.memory_chunks enable row level security;
alter table public.audit_log enable row level security;

-- Deny-all by default: the app only reads/writes via the service-role key
-- from server-side routes, which bypasses RLS entirely. No policies are
-- created here on purpose, matching the blueprint's "deny-all, service
-- role bypasses RLS" instruction.
