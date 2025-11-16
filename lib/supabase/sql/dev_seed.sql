-- Supabase SQL Editor用 日本語サンプルデータ投入スクリプト
-- 実行前に auth.users に対象メールのユーザーが存在すること（例: test@example.com）

BEGIN;

-- 1) プロフィール（表示名）を日本語でアップサート
WITH u AS (
  SELECT id FROM auth.users WHERE email='test@example.com'
)
INSERT INTO public.profiles (id, display_name)
SELECT id, 'テストユーザー' FROM u
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- 2) 3日間の日本語サンプル旅行を作成
WITH u AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
)
INSERT INTO public.trips (owner_id, title, description, start_date, end_date, currency_code)
SELECT
  owner_id,
  '春の京都旅行',
  '桜の名所を巡る2泊3日の旅',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '2 day',
  'JPY'
FROM u;

-- 3) trip_days を3日分作成（当日＋1日＋2日）
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.trip_days (trip_id, date)
SELECT trip_id, CURRENT_DATE FROM lt;
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.trip_days (trip_id, date)
SELECT trip_id, CURRENT_DATE + INTERVAL '1 day' FROM lt;
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.trip_days (trip_id, date)
SELECT trip_id, CURRENT_DATE + INTERVAL '2 day' FROM lt;

-- 4) 予算（budgets）をアップサート
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.budgets (trip_id, amount, currency)
SELECT trip_id, 80000, 'JPY' FROM lt
ON CONFLICT (trip_id) DO UPDATE
  SET amount = EXCLUDED.amount,
      currency = EXCLUDED.currency;

-- 5) アクティビティ（各日6件、日本語）
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
), d AS (
  SELECT td.id AS day_id, td.trip_id, td.date
  FROM public.trip_days td
  WHERE td.trip_id=(SELECT trip_id FROM lt)
), tmpl AS (
  SELECT * FROM (
    VALUES
      (1, '朝食（喫茶リバティ）', '08:00', NULL,    '四条河原町',          'サンプル'),
      (2, '伏見稲荷大社 参拝',   '10:00', '12:00', '伏見稲荷大社',        'サンプル'),
      (3, '昼食（錦市場）',       '12:30', NULL,    '錦市場',              'サンプル'),
      (4, '清水寺 散策',         '14:30', '16:00', '清水寺',              'サンプル'),
      (5, 'ホテル チェックイン', '16:30', NULL,    '京都駅前ホテル',      'サンプル'),
      (6, '夕食（祇園エリア）',   '18:30', NULL,    '祇園',                'サンプル')
  ) AS t(seq, title, start_time, end_time, location, note)
)
INSERT INTO public.activities (trip_id, title, start_time, end_time, location, note, day_id, order_no)
SELECT d.trip_id, tmpl.title, tmpl.start_time, tmpl.end_time, tmpl.location, tmpl.note, d.day_id, tmpl.seq - 1
FROM d CROSS JOIN tmpl
ORDER BY d.date, tmpl.seq;

-- 6) 経費（各日：朝食/昼食/夕食/交通費）
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
), d AS (
  SELECT td.trip_id, td.date FROM public.trip_days td WHERE td.trip_id=(SELECT trip_id FROM lt)
), u AS (
  SELECT id AS user_id FROM auth.users WHERE email='test@example.com'
)
INSERT INTO public.expenses (trip_id, date, title, category, amount, paid_by, paid_by_name, split_with)
SELECT d.trip_id, d.date, e.title, e.category, e.amount, (SELECT user_id FROM u), NULL, ARRAY[(SELECT user_id FROM u)]
FROM d
CROSS JOIN (
  VALUES
    ('朝食',   '食事',   800),
    ('昼食',   '食事',  1200),
    ('夕食',   '食事',  2500),
    ('交通費', '交通',  1500)
) AS e(title, category, amount);

-- 7) タスク（日本語）
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.tasks (trip_id, title, kind, done, sort_order)
SELECT trip_id, 'チケットを予約',      'todo',   false, 1 FROM lt
UNION ALL SELECT trip_id, '荷造りを進める',    'packing',false, 2 FROM lt
UNION ALL SELECT trip_id, '充電器・バッテリー準備','todo',   false, 3 FROM lt
UNION ALL SELECT trip_id, 'ホテル予約の確認',  'todo',   false, 4 FROM lt
UNION ALL SELECT trip_id, 'ICカードを購入',    'todo',   false, 5 FROM lt;

COMMIT;

-- 実行メモ:
-- - auth.users に対象メールのユーザーを作成してから実行してください。
-- - 金額・タイトルなどは任意に調整可能です。

