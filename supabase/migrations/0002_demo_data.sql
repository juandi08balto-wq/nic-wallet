-- Nic Wallet — demo data
-- Seeds 6 demo profiles, balances, and a few transactions for the
-- contact picker / activity feed. Run AFTER 0001_init.sql.
--
-- Note: demo profiles intentionally do NOT have corresponding auth.users
-- rows. profiles.id has no FK to auth.users; the application layer
-- maintains the link for real users.

INSERT INTO public.profiles (id, name, phone, cedula, wallet_tag, pin, low_data_mode) VALUES
  ('11111111-1111-1111-1111-111111111111', 'María López',     '50588123456', '00101200100010M', 'maria',  '0000', false),
  ('22222222-2222-2222-2222-222222222222', 'Juan Pérez',      '50587559821', '00102200200020J', 'juan',   '0000', false),
  ('33333333-3333-3333-3333-333333333333', 'Carlos Rivas',    '50586341129', '00103200300030C', 'carlos', '0000', false),
  ('44444444-4444-4444-4444-444444444444', 'Ana Sánchez',     '50585217733', '00104200400040A', 'ana',    '0000', false),
  ('55555555-5555-5555-5555-555555555555', 'Luis Hernández',  '50584892245', '00105200500050L', 'luis',   '0000', false),
  ('66666666-6666-6666-6666-666666666666', 'Sofía Castillo',  '50583126678', '00106200600060S', 'sofia',  '0000', false)
ON CONFLICT (id) DO NOTHING;

-- USD balances
INSERT INTO public.balances (user_id, currency, amount)
SELECT id, 'USD', 250.00
FROM public.profiles
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
)
ON CONFLICT (user_id, currency) DO NOTHING;

-- NIO balances
INSERT INTO public.balances (user_id, currency, amount)
SELECT id, 'NIO', 9000.00
FROM public.profiles
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
)
ON CONFLICT (user_id, currency) DO NOTHING;

-- Sample transactions (completed) — trigger will adjust balances accordingly.
-- Skip on conflict so re-runs don't duplicate.
INSERT INTO public.transactions (id, sender_id, recipient_id, type, amount, currency, message, status, created_at) VALUES
  ('a0000001-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222',
   'send', 500.00, 'NIO', 'Almuerzo', 'completed', now() - interval '2 days'),
  ('a0000001-0000-0000-0000-000000000002',
   '33333333-3333-3333-3333-333333333333',
   '11111111-1111-1111-1111-111111111111',
   'send', 20.00, 'USD', 'Pago de la renta', 'completed', now() - interval '1 day'),
  ('a0000001-0000-0000-0000-000000000003',
   '44444444-4444-4444-4444-444444444444',
   '22222222-2222-2222-2222-222222222222',
   'send', 150.00, 'NIO', 'Aporte', 'completed', now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;
