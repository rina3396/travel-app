-- 20251101_owner_schema.sql
-- Travel App: A案（owner_id 統一）ベースのDDL + RLS
-- 注意: 本スクリプトは既存テーブルを前提にCREATE IF NOT EXISTSで構成しています。
-- クリーンに作り直す場合は、明示的にDROPしてから実行してください。

-- 1) 必要拡張
create extension if not exists pgcrypto;

-- 2) 列挙型
do $$ begin
  create type public.member_role as enum ('owner','editor','viewer');
exception when duplicate_object then null; end $$;

-- 3) updated_at トリガ関数
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- 4) テーブル

-- profiles（表示名など）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- trips（owner_id 前提）
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  title text not null,
  description text,
  start_date date,
  end_date date,
  currency_code text not null default 'JPY',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_date_range check (start_date is null or end_date is null or start_date <= end_date)
);
drop trigger if exists trg_trips_updated_at on public.trips;
create trigger trg_trips_updated_at before update on public.trips
for each row execute function public.set_updated_at();

-- trip_members（UUID紐づけ）
create table if not exists public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'viewer',
  added_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

-- trip_days（日付×trip で一意。day_idはactivitiesから参照）
create table if not exists public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, date)
);
drop trigger if exists trg_trip_days_updated_at on public.trip_days;
create trigger trg_trip_days_updated_at before update on public.trip_days
for each row execute function public.set_updated_at();

-- activities（APIのsnake_caseに合わせる）
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null,
  start_time text,
  end_time text,
  location text,
  note text,
  day_id uuid references public.trip_days(id) on delete set null,
  order_no integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_activities_updated_at on public.activities;
create trigger trg_activities_updated_at before update on public.activities
for each row execute function public.set_updated_at();

-- expenses（予算・費用UIに合わせる）
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  title text not null,
  category text,
  amount numeric not null,
  paid_by uuid references auth.users(id) on delete set null,
  split_with uuid[] not null default '{}'::uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at before update on public.expenses
for each row execute function public.set_updated_at();

-- tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null,
  kind text not null default 'todo',
  done boolean not null default false,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

-- share_links
create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  is_enabled boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- budgets
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null unique references public.trips(id) on delete cascade,
  amount numeric not null default 0,
  currency text not null default 'JPY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_budgets_updated_at on public.budgets;
create trigger trg_budgets_updated_at before update on public.budgets
for each row execute function public.set_updated_at();

-- 5) RLS 関数
create or replace function public.is_trip_member(p_trip_id uuid, p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.trips t where t.id = p_trip_id and t.owner_id = p_user_id
  ) or exists (
    select 1 from public.trip_members m where m.trip_id = p_trip_id and m.user_id = p_user_id
  );
$$;

create or replace function public.has_edit_permission(p_trip_id uuid, p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.trips t where t.id = p_trip_id and t.owner_id = p_user_id
  ) or exists (
    select 1 from public.trip_members m where m.trip_id = p_trip_id and m.user_id = p_user_id and m.role in ('owner','editor')
  );
$$;

-- 6) RLS 有効化
alter table public.profiles     enable row level security;
alter table public.trips        enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_days    enable row level security;
alter table public.activities   enable row level security;
alter table public.expenses     enable row level security;
alter table public.tasks        enable row level security;
alter table public.share_links  enable row level security;
alter table public.budgets      enable row level security;

-- 7) ポリシー（存在すれば置換）

-- profiles
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists profiles_self_modify on public.profiles;
create policy profiles_self_modify on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- trips
drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips
  for select to authenticated using (public.is_trip_member(id, auth.uid()));

drop policy if exists trips_insert on public.trips;
create policy trips_insert on public.trips
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists trips_update on public.trips;
create policy trips_update on public.trips
  for update to authenticated using (public.has_edit_permission(id, auth.uid())) with check (public.has_edit_permission(id, auth.uid()));

drop policy if exists trips_delete on public.trips;
create policy trips_delete on public.trips
  for delete to authenticated using (public.has_edit_permission(id, auth.uid()));

-- trip_members
drop policy if exists trip_members_select on public.trip_members;
create policy trip_members_select on public.trip_members
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));

drop policy if exists trip_members_insert on public.trip_members;
create policy trip_members_insert on public.trip_members
  for insert to authenticated with check (public.has_edit_permission(trip_id, auth.uid()));

drop policy if exists trip_members_update on public.trip_members;
create policy trip_members_update on public.trip_members
  for update to authenticated using (public.has_edit_permission(trip_id, auth.uid())) with check (public.has_edit_permission(trip_id, auth.uid()));

drop policy if exists trip_members_delete on public.trip_members;
create policy trip_members_delete on public.trip_members
  for delete to authenticated using (public.has_edit_permission(trip_id, auth.uid()));

-- trip_days
drop policy if exists trip_days_select on public.trip_days;
create policy trip_days_select on public.trip_days
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));

drop policy if exists trip_days_crud on public.trip_days;
create policy trip_days_crud on public.trip_days
  for all to authenticated using (public.has_edit_permission(trip_id, auth.uid())) with check (public.has_edit_permission(trip_id, auth.uid()));

-- activities
drop policy if exists activities_select on public.activities;
create policy activities_select on public.activities
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));

drop policy if exists activities_crud on public.activities;
create policy activities_crud on public.activities
  for all to authenticated using (public.has_edit_permission(trip_id, auth.uid())) with check (public.has_edit_permission(trip_id, auth.uid()));

-- expenses
drop policy if exists expenses_select on public.expenses;
create policy expenses_select on public.expenses
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));

drop policy if exists expenses_crud on public.expenses;
create policy expenses_crud on public.expenses
  for all to authenticated using (public.has_edit_permission(trip_id, auth.uid())) with check (public.has_edit_permission(trip_id, auth.uid()));

-- tasks
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select to authenticated using (public.is_trip_member(trip_id, auth.uid()));

drop policy if exists tasks_crud on public.tasks;
create policy tasks_crud on public.tasks
  for all to authenticated using (public.has_edit_permission(trip_id, auth.uid())) with check (public.has_edit_permission(trip_id, auth.uid()));

-- share_links
drop policy if exists share_links_select on public.share_links;
create policy share_links_select on public.share_links
  for select to authenticated using (public.has_edit_permission(trip_id, auth.uid()));

drop policy if exists share_links_crud on public.share_links;
create policy share_links_crud on public.share_links
  for all to authenticated using (public.has_edit_permission(trip_id, auth.uid())) with check (public.has_edit_permission(trip_id, auth.uid()));

