-- budgets テーブル（旅ごとの予算サマリ）
-- 注意: 実DBで適用するには supabase CLI か SQL 実行環境でこのスクリプトを流してください。

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  amount numeric not null default 0,
  currency text not null default 'JPY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(trip_id)
);

-- updated_at 自動更新
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_budgets_updated_at on public.budgets;
create trigger trg_budgets_updated_at
before update on public.budgets
for each row execute function public.set_updated_at();

-- RLS（必要に応じて有効化）
-- alter table public.budgets enable row level security;
-- 例: 所有者またはメンバーに限って参照・更新を許可するポリシー
-- create policy "budgets_select"
--   on public.budgets for select
--   using (
--     exists(select 1 from public.trips t where t.id = budgets.trip_id and (t.user_id = auth.uid())) or
--     exists(select 1 from public.trip_members m where m.trip_id = budgets.trip_id and m.user_id = auth.uid())
--   );
-- create policy "budgets_modify"
--   on public.budgets for insert with check (exists(select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()))
--   to authenticated;
-- create policy "budgets_update"
--   on public.budgets for update using (exists(select 1 from public.trips t where t.id = budgets.trip_id and t.user_id = auth.uid()))
--   to authenticated;

