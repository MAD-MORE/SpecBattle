create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.phones (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  manufacturer_device_id text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (brand, model)
);

create table if not exists public.specification_definitions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  category text not null,
  unit text,
  data_type text not null default 'number',
  comparison_direction text not null check (comparison_direction in ('higher','lower','custom')),
  normalization_method text not null default 'pairwise_minmax',
  default_weight numeric not null default 1 check (default_weight >= 0),
  model_version integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.phone_specifications (
  phone_id uuid not null references public.phones(id) on delete cascade,
  specification_id uuid not null references public.specification_definitions(id) on delete cascade,
  numeric_value numeric,
  text_value text,
  source text,
  confidence numeric check (confidence is null or confidence between 0 and 1),
  verified_at timestamptz,
  primary key (phone_id, specification_id)
);

create table if not exists public.battles (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  status text not null default 'waiting' check (status in ('waiting','ready','running','finished','cancelled')),
  phone_a_id uuid not null references public.phones(id),
  phone_b_id uuid references public.phones(id),
  winner text check (winner in ('A','B','DRAW')),
  model_version integer not null default 1,
  overall_score_a numeric,
  overall_score_b numeric,
  confidence numeric,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.battle_players (
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  side text not null check (side in ('A','B')),
  ready boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (battle_id, user_id),
  unique (battle_id, side)
);

create table if not exists public.battle_rounds (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  round_number integer not null,
  category text not null,
  score_a numeric not null,
  score_b numeric not null,
  winner text not null check (winner in ('A','B','DRAW','UNKNOWN')),
  created_at timestamptz not null default now(),
  unique (battle_id, round_number)
);

create table if not exists public.battle_results (
  battle_id uuid primary key references public.battles(id) on delete cascade,
  comparable_count integer not null default 0,
  unknown_count integer not null default 0,
  category_results jsonb not null default '{}'::jsonb,
  explanation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.phone_ratings (
  phone_id uuid primary key references public.phones(id) on delete cascade,
  rating numeric not null default 1500,
  battles integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.category_ratings (
  phone_id uuid not null references public.phones(id) on delete cascade,
  category text not null,
  rating numeric not null default 1500,
  battles integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (phone_id, category)
);

alter table public.profiles enable row level security;
alter table public.phones enable row level security;
alter table public.specification_definitions enable row level security;
alter table public.phone_specifications enable row level security;
alter table public.battles enable row level security;
alter table public.battle_players enable row level security;
alter table public.battle_rounds enable row level security;
alter table public.battle_results enable row level security;
alter table public.phone_ratings enable row level security;
alter table public.category_ratings enable row level security;

create policy "profiles are readable" on public.profiles for select to authenticated using (true);
create policy "users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "phones are readable" on public.phones for select to authenticated using (true);
create policy "spec definitions are readable" on public.specification_definitions for select to authenticated using (true);
create policy "phone specs are readable" on public.phone_specifications for select to authenticated using (true);
create policy "ratings are readable" on public.phone_ratings for select to authenticated using (true);
create policy "category ratings are readable" on public.category_ratings for select to authenticated using (true);

create policy "players can read their battles" on public.battles for select to authenticated
  using (created_by = (select auth.uid()) or exists (
    select 1 from public.battle_players bp where bp.battle_id = battles.id and bp.user_id = (select auth.uid())
  ));

create policy "creator can create battle" on public.battles for insert to authenticated
  with check (created_by = (select auth.uid()));

create policy "players can read battle players" on public.battle_players for select to authenticated
  using (user_id = (select auth.uid()) or exists (
    select 1 from public.battles b where b.id = battle_players.battle_id and b.created_by = (select auth.uid())
  ));

create policy "users can join as themselves" on public.battle_players for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "users can read rounds of joined battles" on public.battle_rounds for select to authenticated
  using (exists (
    select 1 from public.battle_players bp where bp.battle_id = battle_rounds.battle_id and bp.user_id = (select auth.uid())
  ));

create policy "users can read results of joined battles" on public.battle_results for select to authenticated
  using (exists (
    select 1 from public.battle_players bp where bp.battle_id = battle_results.battle_id and bp.user_id = (select auth.uid())
  ));

-- Realtime must be explicitly enabled for battle state tables in the Supabase dashboard/replication settings.
