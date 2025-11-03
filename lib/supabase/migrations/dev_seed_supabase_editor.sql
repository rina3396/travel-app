-- Supabase SQL Editor seed (3-day rich sample)
-- Assumes auth.users has: test@example.com (password: pw0rd1111)

BEGIN;

-- 1) profiles upsert for test user
WITH u AS (
  SELECT id FROM auth.users WHERE email='test@example.com'
)
INSERT INTO public.profiles (id, display_name)
SELECT id, 'Test User' FROM u
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- 2) create a 3-day trip owned by the test user
WITH u AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
)
INSERT INTO public.trips (owner_id, title, start_date, end_date, currency_code)
SELECT owner_id, 'Sample Trip', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 day', 'JPY' FROM u;

-- 3) trip_days for the most recently created trip of the test user
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.trip_days (trip_id, date)
SELECT trip_id, CURRENT_DATE FROM lt;
INSERT INTO public.trip_days (trip_id, date)
SELECT trip_id, CURRENT_DATE + INTERVAL '1 day' FROM lt;
INSERT INTO public.trip_days (trip_id, date)
SELECT trip_id, CURRENT_DATE + INTERVAL '2 day' FROM lt;

-- 4) budget upsert
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.budgets (trip_id, amount, currency)
SELECT trip_id, 50000, 'JPY' FROM lt
ON CONFLICT (trip_id) DO UPDATE SET amount = EXCLUDED.amount, currency = EXCLUDED.currency;

-- 5) activities (6 items per each of the 3 days)
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
      (1, 'Breakfast at Cafe', '08:00', NULL,   'Central Cafe',   'seed'),
      (2, 'City Museum Tour',  '10:00', '12:00','City Museum',    'seed'),
      (3, 'Lunch at Market',   '12:30', NULL,   'Local Market',   'seed'),
      (4, 'Train to Next Spot','15:00', '16:00','Central Station','seed'),
      (5, 'Hotel Check-in',    '16:30', NULL,   'Hotel Lobby',    'seed'),
      (6, 'Dinner Downtown',   '18:30', NULL,   'Downtown',       'seed')
  ) AS t(seq, title, start_time, end_time, location, note)
)
INSERT INTO public.activities (trip_id, title, start_time, end_time, location, note, day_id, order_no)
SELECT d.trip_id, tmpl.title, tmpl.start_time, tmpl.end_time, tmpl.location, tmpl.note, d.day_id, tmpl.seq - 1
FROM d CROSS JOIN tmpl
ORDER BY d.date, tmpl.seq;

-- 6) expenses (per day: breakfast, lunch, dinner, transport)
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
INSERT INTO public.expenses (trip_id, date, title, category, amount, paid_by, split_with)
SELECT d.trip_id, d.date, e.title, e.category, e.amount, (SELECT user_id FROM u), ARRAY[(SELECT user_id FROM u)]
FROM d
CROSS JOIN (
  VALUES
    ('Breakfast','meal',700),
    ('Lunch','meal',1200),
    ('Dinner','meal',2000),
    ('Transport','transport',1500)
) AS e(title, category, amount);

-- 7) tasks
WITH owner AS (
  SELECT id AS owner_id FROM auth.users WHERE email='test@example.com'
), lt AS (
  SELECT id AS trip_id FROM public.trips
  WHERE owner_id=(SELECT owner_id FROM owner)
  ORDER BY created_at DESC LIMIT 1
)
INSERT INTO public.tasks (trip_id, title, kind, done, sort_order)
SELECT trip_id, 'Book tickets', 'todo', false, 1 FROM lt
UNION ALL SELECT trip_id, 'Pack luggage', 'packing', false, 2 FROM lt
UNION ALL SELECT trip_id, 'Charge devices', 'todo', false, 3 FROM lt
UNION ALL SELECT trip_id, 'Confirm hotel', 'todo', false, 4 FROM lt
UNION ALL SELECT trip_id, 'Buy IC card', 'todo', false, 5 FROM lt;

COMMIT;

