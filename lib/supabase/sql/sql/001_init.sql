-- ============================================
-- travel-app : Supabase 初期セットアップSQL（順序修正版）
-- ============================================

-- ---------- 拡張 ----------
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- ---------- ENUM ----------
do $$ begin
  create type member_role as enum ('owner','editor','viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transport_mode as enum ('walk','car','train','bus','plane','boat','other');
exception when duplicate_object then null; end $$;

-- ---------- 汎用: updated_at トリガ関数 ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ============================================
-- 1) テーブル定義（先に作る）
-- ============================================

-- profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- trips
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  currency_code text not null default 'JPY',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_date_range check (start_date <= end_date)
);

-- trip_members
create table if not exists trip_members (
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role member_role not null default 'viewer',
  added_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

-- trip_days
create table if not exists trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, date)
);

-- activities
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  date date not null,
  start_time time,
  end_time time,
  title text not null,
  location_text text,
  lat double precision,
  lng double precision,
  transport transport_mode default 'other',
  memo text,
  cost_estimate numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  activity_id uuid references activities(id) on delete set null,
  amount numeric(12,2) not null,
  currency_code text not null default 'JPY',
  category text,
  paid_by uuid references auth.users(id) on delete set null,
  memo text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  assignee_id uuid references auth.users(id) on delete set null,
  due_date date,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- share_links
create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete set null,
  is_enabled boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- 2) トリガ / インデックス
-- ============================================

-- triggers
drop trigger if exists trg_profiles_updated on profiles;
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();

drop trigger if exists trg_trips_updated on trips;
create trigger trg_trips_updated before update on trips for each row execute function set_updated_at();

drop trigger if exists trg_trip_days_updated on trip_days;
create trigger trg_trip_days_updated before update on trip_days for each row execute function set_updated_at();

drop trigger if exists trg_activities_updated on activities;
create trigger trg_activities_updated before update on activities for each row execute function set_updated_at();

drop trigger if exists trg_expenses_updated on expenses;
create trigger trg_expenses_updated before update on expenses for each row execute function set_updated_at();

drop trigger if exists trg_tasks_updated on tasks;
create trigger trg_tasks_updated before update on tasks for each row execute function set_updated_at();

-- indexes（必要最低限）
create index if not exists idx_trips_owner on trips(owner_id);
create index if not exists idx_trip_members_user on trip_members(user_id);
create index if not exists idx_trip_days_trip_date on trip_days(trip_id, date);
create index if not exists idx_activities_trip_date on activities(trip_id, date);
create index if not exists idx_expenses_trip on expenses(trip_id);
create index if not exists idx_share_links_trip on share_links(trip_id);

-- ============================================
-- 3) 権限チェック関数（テーブル作成後に作る！）
-- ============================================

create or replace function is_trip_member(p_trip_id uuid, p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from trips t where t.id = p_trip_id and t.owner_id = p_user_id
    union all
    select 1 from trip_members m where m.trip_id = p_trip_id and m.user_id = p_user_id
  );
$$;

create or replace function has_edit_permission(p_trip_id uuid, p_user_id uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from trips t where t.id = p_trip_id and t.owner_id = p_user_id
    union all
    select 1 from trip_members m where m.trip_id = p_trip_id and m.user_id = p_user_id and m.role in ('owner','editor')
  );
$$;

-- ============================================
-- 4) RLS / ポリシー
-- ============================================

alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table trip_days enable row level security;
alter table activities enable row level security;
alter table expenses enable row level security;
alter table tasks enable row level security;
alter table share_links enable row level security;

-- profiles
drop policy if exists profiles_self_select on profiles;
create policy profiles_self_select on profiles for select using (auth.uid() = id);

drop policy if exists profiles_self_modify on profiles;
create policy profiles_self_modify on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_self_insert on profiles;
create policy profiles_self_insert on profiles for insert with check (auth.uid() = id);

-- trips
drop policy if exists trips_select on trips;
create policy trips_select on trips for select using (is_trip_member(id, auth.uid()));

drop policy if exists trips_insert on trips;
create policy trips_insert on trips for insert with check (auth.uid() = owner_id);

drop policy if exists trips_update on trips;
create policy trips_update on trips for update using (has_edit_permission(id, auth.uid())) with check (has_edit_permission(id, auth.uid()));

drop policy if exists trips_delete on trips;
create policy trips_delete on trips for delete using (has_edit_permission(id, auth.uid()));

-- trip_members
drop policy if exists trip_members_select on trip_members;
create policy trip_members_select on trip_members for select using (is_trip_member(trip_id, auth.uid()));

drop policy if exists trip_members_insert on trip_members;
create policy trip_members_insert on trip_members for insert with check (has_edit_permission(trip_id, auth.uid()));

drop policy if exists trip_members_update on trip_members;
create policy trip_members_update on trip_members for update using (has_edit_permission(trip_id, auth.uid())) with check (has_edit_permission(trip_id, auth.uid()));

drop policy if exists trip_members_delete on trip_members;
create policy trip_members_delete on trip_members for delete using (has_edit_permission(trip_id, auth.uid()));

-- trip_days
drop policy if exists trip_days_select on trip_days;
create policy trip_days_select on trip_days for select using (is_trip_member(trip_id, auth.uid()));

drop policy if exists trip_days_crud on trip_days;
create policy trip_days_crud on trip_days for all using (has_edit_permission(trip_id, auth.uid())) with check (has_edit_permission(trip_id, auth.uid()));

-- activities
drop policy if exists activities_select on activities;
create policy activities_select on activities for select using (is_trip_member(trip_id, auth.uid()));

drop policy if exists activities_crud on activities;
create policy activities_crud on activities for all using (has_edit_permission(trip_id, auth.uid())) with check (has_edit_permission(trip_id, auth.uid()));

-- expenses
drop policy if exists expenses_select on expenses;
create policy expenses_select on expenses for select using (is_trip_member(trip_id, auth.uid()));

drop policy if exists expenses_crud on expenses;
create policy expenses_crud on expenses for all using (has_edit_permission(trip_id, auth.uid())) with check (has_edit_permission(trip_id, auth.uid()));

-- tasks
drop policy if exists tasks_select on tasks;
create policy tasks_select on tasks for select using (is_trip_member(trip_id, auth.uid()));

drop policy if exists tasks_crud on tasks;
create policy tasks_crud on tasks for all using (has_edit_permission(trip_id, auth.uid())) with check (has_edit_permission(trip_id, auth.uid()));

-- share_links
drop policy if exists share_links_select on share_links;
create policy share_links_select on share_links for select using (has_edit_permission(trip_id, auth.uid()));

drop policy if exists share_links_crud on share_links;
create policy share_links_crud on share_links for all using (has_edit_permission(trip_id, auth.uid())) with check (has_edit_permission(trip_id, auth.uid()));

-- ============================================
-- 5) 公開RPC
-- ============================================

create or replace function public_get_shared_trip(p_share_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trip_id uuid;
  v_payload jsonb;
begin
  select trip_id into v_trip_id
  from share_links
  where id = p_share_id
    and is_enabled = true
    and (expires_at is null or expires_at > now())
  limit 1;

  if v_trip_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'trip', to_jsonb(t.*) - 'owner_id' - 'updated_at',
    'days', coalesce((select jsonb_agg(to_jsonb(d.*)) from trip_days d where d.trip_id = t.id order by d.date), '[]'::jsonb),
    'activities', coalesce((select jsonb_agg(to_jsonb(a.*)) from activities a where a.trip_id = t.id order by a.date, a.start_time nulls first), '[]'::jsonb),
    'expenses', coalesce((select jsonb_agg(to_jsonb(e.*) - 'paid_by') from expenses e where e.trip_id = t.id order by e.occurred_at), '[]'::jsonb),
    'tasks', coalesce((select jsonb_agg(to_jsonb(tsk.*) - 'assignee_id') from tasks tsk where tsk.trip_id = t.id order by coalesce(tsk.sort_order,0), tsk.created_at), '[]'::jsonb)
  ) into v_payload
  from trips t
  where t.id = v_trip_id;

  return v_payload;
end $$;

revoke all on function public_get_shared_trip(uuid) from anon, authenticated;
grant execute on function public_get_shared_trip(uuid) to anon, authenticated;

-- ============================================
-- End of File
-- ============================================
