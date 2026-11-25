-- ============================================================================
-- ForgeLeague Cloud Schema & Row-Level Security (Supabase / PostgreSQL)
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. User Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text,
  phone text,
  username text unique,
  created_at timestamptz not null default now()
);

-- 2. Franchises / Teams Vault
create table if not exists public.franchises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  sport_id text not null,
  seed_code varchar(10) not null,
  name text not null,
  logo_dna text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Custom Sports
create table if not exists public.custom_sports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  visibility text not null default 'private' check (visibility in ('private', 'unlisted', 'public')),
  cloned_from_slug text,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Competitions (Leagues & Cups)
create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  sport_id text not null,
  name text not null,
  slug text unique not null,
  visibility text not null default 'private' check (visibility in ('private', 'unlisted', 'public')),
  payload jsonb not null,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Granular Collaborator Access Matrix
create table if not exists public.collaborators (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null check (resource_type in ('competition', 'custom_sport')),
  resource_id uuid not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  identifier text not null,
  identifier_type text not null check (identifier_type in ('email', 'google', 'phone', 'username')),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'active')),
  role_preset text not null default 'viewer',
  permissions jsonb not null default '{
    "canView": true,
    "canSimulateMatches": false,
    "canSimulateSeason": false,
    "canUndoSimulations": false,
    "canEditTeamsAndRosters": false,
    "canEditScheduleAndDates": false,
    "canEditRulesAndAdvantages": false,
    "canManageCollaborators": false
  }'::jsonb,
  created_at timestamptz not null default now()
);

-- 6. Zero-Duplicate Global Registry
create table if not exists public.global_registries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team_name_norm text not null,
  logo_dna text not null,
  seed_code varchar(10) not null,
  created_at timestamptz not null default now(),
  unique (owner_id, team_name_norm),
  unique (owner_id, logo_dna)
);

-- Enable Row-Level Security
alter table public.profiles enable row level security;
alter table public.franchises enable row level security;
alter table public.custom_sports enable row level security;
alter table public.competitions enable row level security;
alter table public.collaborators enable row level security;
alter table public.global_registries enable row level security;

-- Helper function to check collaborator JSONB boolean permissions
create or replace function public.has_collaborator_permission(
  p_resource_type text,
  p_resource_id uuid,
  p_perm text
) returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.collaborators c
    left join public.profiles p on p.id = auth.uid()
    where c.resource_type = p_resource_type
      and c.resource_id = p_resource_id
      and (c.permissions ->> p_perm)::boolean = true
      and (
        c.user_id = auth.uid()
        or lower(c.identifier) = lower(coalesce(auth.jwt() ->> 'email', ''))
        or c.identifier = coalesce(auth.jwt() ->> 'phone', '')
        or lower(c.identifier) = lower(coalesce(p.username, ''))
      )
  );
$$;

-- RLS Policies
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "franchises_owner" on public.franchises
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "global_registries_owner" on public.global_registries
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "custom_sports_read" on public.custom_sports
  for select using (
    visibility in ('public', 'unlisted')
    or auth.uid() = owner_id
    or public.has_collaborator_permission('custom_sport', id, 'canView')
  );

create policy "custom_sports_write" on public.custom_sports
  for insert with check (auth.uid() = owner_id);

create policy "custom_sports_update" on public.custom_sports
  for update using (
    auth.uid() = owner_id
    or public.has_collaborator_permission('custom_sport', id, 'canEditRulesAndAdvantages')
  );

create policy "custom_sports_delete" on public.custom_sports
  for delete using (auth.uid() = owner_id);

create policy "competitions_read" on public.competitions
  for select using (
    visibility in ('public', 'unlisted')
    or auth.uid() = owner_id
    or public.has_collaborator_permission('competition', id, 'canView')
  );

create policy "competitions_insert" on public.competitions
  for insert with check (auth.uid() = owner_id);

create policy "competitions_update" on public.competitions
  for update using (
    auth.uid() = owner_id
    or public.has_collaborator_permission('competition', id, 'canSimulateMatches')
    or public.has_collaborator_permission('competition', id, 'canSimulateSeason')
    or public.has_collaborator_permission('competition', id, 'canUndoSimulations')
    or public.has_collaborator_permission('competition', id, 'canEditTeamsAndRosters')
    or public.has_collaborator_permission('competition', id, 'canEditScheduleAndDates')
    or public.has_collaborator_permission('competition', id, 'canEditRulesAndAdvantages')
  );

create policy "competitions_delete" on public.competitions
  for delete using (auth.uid() = owner_id);

create policy "collaborators_manage" on public.collaborators
  for all using (
    auth.uid() = invited_by
    or public.has_collaborator_permission(resource_type, resource_id, 'canManageCollaborators')
  )
  with check (
    auth.uid() = invited_by
    or public.has_collaborator_permission(resource_type, resource_id, 'canManageCollaborators')
  );
