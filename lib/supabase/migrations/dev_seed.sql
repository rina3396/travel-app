-- supabase/seeds/dev_seed.sql
-- 注意: 実行前に USER_1 / USER_2 を実在する auth.users.id に置換してください
-- 例: :USER_1 と :USER_2 プレースホルダ

BEGIN;

-- 1) プロファイル
INSERT INTO public.profiles (id, display_name)
VALUES
  (:USER_1, 'Dev Owner'),
  (:USER_2, 'Dev Editor')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- 2) トリップ
INSERT INTO public.trips (owner_id, title, start_date, end_date, currency_code)
VALUES (:USER_1, 'サンプルトリップ', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 day', 'JPY')
RETURNING id INTO TEMP TABLE _trip(id);

-- 3) メンバー
INSERT INTO public.trip_members (trip_id, user_id, role)
SELECT id, :USER_2, 'editor'::public.member_role FROM _trip;

-- 4) 日付（3日分）
INSERT INTO public.trip_days (trip_id, date)
SELECT id, CURRENT_DATE FROM _trip;
INSERT INTO public.trip_days (trip_id, date)
SELECT id, CURRENT_DATE + INTERVAL '1 day' FROM _trip;
INSERT INTO public.trip_days (trip_id, date)
SELECT id, CURRENT_DATE + INTERVAL '2 day' FROM _trip;

-- 5) 予算
INSERT INTO public.budgets (trip_id, amount, currency)
SELECT id, 50000, 'JPY' FROM _trip
ON CONFLICT (trip_id) DO UPDATE SET amount = EXCLUDED.amount, currency = EXCLUDED.currency;

-- 6) 費用
INSERT INTO public.expenses (trip_id, date, title, category, amount, paid_by, split_with)
SELECT id, CURRENT_DATE, '朝食', 'meal', 800, :USER_1, ARRAY[:USER_1, :USER_2] FROM _trip;

-- 7) アクティビティ（各日1件）
WITH d AS (
  SELECT td.id, td.trip_id, td.date
  FROM public.trip_days td
  JOIN _trip t ON t.id = td.trip_id
)
INSERT INTO public.activities (trip_id, title, start_time, location, note, day_id, order_no)
SELECT d.trip_id, 'アクティビティ', '09:30', 'サンプルスポット', 'seed', d.id, ROW_NUMBER() OVER (ORDER BY d.date) - 1
FROM d
ORDER BY d.date;

DROP TABLE IF EXISTS _trip;

COMMIT;

