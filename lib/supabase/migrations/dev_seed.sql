-- supabase/seeds/dev_seed.sql
-- Note: Pass :USER_1 as the UUID of an existing auth.users row (e.g., test@example.com)

BEGIN;

-- 1) profiles (single user)
INSERT INTO public.profiles (id, display_name)
VALUES (:USER_1, 'Test User')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Use a temp table to reference the newly created trip
CREATE TEMP TABLE _trip (id uuid);
WITH ins AS (
  INSERT INTO public.trips (owner_id, title, start_date, end_date, currency_code)
  VALUES (:USER_1, 'Sample Trip', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 day', 'JPY')
  RETURNING id
)
INSERT INTO _trip
SELECT id FROM ins;

-- 3) trip_members (none for single-user scenario)

-- 4) trip_days (3 days)
INSERT INTO public.trip_days (trip_id, date)
SELECT id, CURRENT_DATE FROM _trip;
INSERT INTO public.trip_days (trip_id, date)
SELECT id, CURRENT_DATE + INTERVAL '1 day' FROM _trip;
INSERT INTO public.trip_days (trip_id, date)
SELECT id, CURRENT_DATE + INTERVAL '2 day' FROM _trip;

-- 5) budget
INSERT INTO public.budgets (trip_id, amount, currency)
SELECT id, 50000, 'JPY' FROM _trip
ON CONFLICT (trip_id) DO UPDATE SET amount = EXCLUDED.amount, currency = EXCLUDED.currency;

-- 6) expenses (per day: breakfast, lunch, dinner, transport)
WITH d AS (
  SELECT td.trip_id, td.date
  FROM public.trip_days td
  JOIN _trip t ON t.id = td.trip_id
)
INSERT INTO public.expenses (trip_id, date, title, category, amount, paid_by, split_with)
SELECT d.trip_id, d.date, e.title, e.category, e.amount, :USER_1, ARRAY[:USER_1]
FROM d
CROSS JOIN (
  VALUES
    ('Breakfast','meal',700),
    ('Lunch','meal',1200),
    ('Dinner','meal',2000),
    ('Transport','transport',1500)
) AS e(title, category, amount);

-- 7) activities (6 items per day)
WITH d AS (
  SELECT td.id AS day_id, td.trip_id, td.date
  FROM public.trip_days td
  JOIN _trip t ON t.id = td.trip_id
), tmpl AS (
  SELECT * FROM (
    VALUES
      (1, 'Breakfast at Cafe', '08:00', NULL, 'Central Cafe', 'seed'),
      (2, 'City Museum Tour', '10:00', '12:00', 'City Museum', 'seed'),
      (3, 'Lunch at Market', '12:30', NULL, 'Local Market', 'seed'),
      (4, 'Train to Next Spot', '15:00', '16:00', 'Central Station', 'seed'),
      (5, 'Hotel Check-in', '16:30', NULL, 'Hotel Lobby', 'seed'),
      (6, 'Dinner Downtown', '18:30', NULL, 'Downtown', 'seed')
  ) AS t(seq, title, start_time, end_time, location, note)
)
INSERT INTO public.activities (trip_id, title, start_time, end_time, location, note, day_id, order_no)
SELECT d.trip_id, tmpl.title, tmpl.start_time, tmpl.end_time, tmpl.location, tmpl.note, d.day_id, tmpl.seq - 1
FROM d CROSS JOIN tmpl
ORDER BY d.date, tmpl.seq;

-- 8) tasks (initial checklist)
INSERT INTO public.tasks (trip_id, title, kind, done, sort_order)
SELECT id, 'Book tickets', 'todo', false, 1 FROM _trip
UNION ALL SELECT id, 'Pack luggage', 'packing', false, 2 FROM _trip
UNION ALL SELECT id, 'Charge devices', 'todo', false, 3 FROM _trip
UNION ALL SELECT id, 'Confirm hotel', 'todo', false, 4 FROM _trip
UNION ALL SELECT id, 'Buy IC card', 'todo', false, 5 FROM _trip;

-- finalize
DROP TABLE IF EXISTS _trip;

COMMIT;
