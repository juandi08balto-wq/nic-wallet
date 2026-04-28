-- Nic Wallet — initial schema, RLS, triggers
-- Run this in the Supabase SQL editor before 0002_demo_data.sql.

-- =====================================================================
-- Tables
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  cedula TEXT,
  avatar_url TEXT,
  pin TEXT NOT NULL,
  wallet_tag TEXT UNIQUE,
  selfie_url TEXT,
  low_data_mode BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_phone_idx ON public.profiles (phone);
CREATE INDEX IF NOT EXISTS profiles_wallet_tag_idx ON public.profiles (wallet_tag);

CREATE TABLE IF NOT EXISTS public.balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'NIO')),
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  UNIQUE (user_id, currency)
);

CREATE INDEX IF NOT EXISTS balances_user_idx ON public.balances (user_id);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  merchant_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('send','receive','merchant','bill','topup','deposit','withdraw','remittance','convert')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'NIO')),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','canceled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_sender_idx ON public.transactions (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_recipient_idx ON public.transactions (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions (status);

CREATE TABLE IF NOT EXISTS public.linked_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_four TEXT NOT NULL CHECK (last_four ~ '^[0-9]{4}$'),
  card_type TEXT NOT NULL CHECK (card_type IN ('visa','mastercard','amex','other')),
  nickname TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS linked_cards_user_idx ON public.linked_cards (user_id);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications (user_id, created_at DESC);

-- =====================================================================
-- Row Level Security
-- =====================================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linked_cards  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: any authenticated user may read (for contact picker incl. demo
-- profiles). Only the owner may insert / update their own row.
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Balances: own only.
DROP POLICY IF EXISTS "balances_select_own" ON public.balances;
CREATE POLICY "balances_select_own" ON public.balances
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "balances_insert_own" ON public.balances;
CREATE POLICY "balances_insert_own" ON public.balances
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "balances_update_own" ON public.balances;
CREATE POLICY "balances_update_own" ON public.balances
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions: read if you're a party. Insert only as sender, or as
-- recipient when sender is null (system credits to self).
DROP POLICY IF EXISTS "transactions_select_party" ON public.transactions;
CREATE POLICY "transactions_select_party" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "transactions_insert_party" ON public.transactions;
CREATE POLICY "transactions_insert_party" ON public.transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    OR (sender_id IS NULL AND auth.uid() = recipient_id)
  );

-- Linked cards: own only.
DROP POLICY IF EXISTS "linked_cards_select_own" ON public.linked_cards;
CREATE POLICY "linked_cards_select_own" ON public.linked_cards
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "linked_cards_modify_own" ON public.linked_cards;
CREATE POLICY "linked_cards_modify_own" ON public.linked_cards
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications: own only.
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- Triggers
-- =====================================================================

-- Money-movement trigger: when a transaction is inserted as completed,
-- atomically debit sender, credit recipient, notify recipient.
CREATE OR REPLACE FUNCTION public.apply_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.sender_id IS NOT NULL THEN
    UPDATE public.balances
    SET amount = amount - NEW.amount
    WHERE user_id = NEW.sender_id AND currency = NEW.currency;
  END IF;

  IF NEW.recipient_id IS NOT NULL THEN
    UPDATE public.balances
    SET amount = amount + NEW.amount
    WHERE user_id = NEW.recipient_id AND currency = NEW.currency;

    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (
      NEW.recipient_id,
      'transaction',
      'Recibiste dinero',
      format(
        'Recibiste %s %s%s',
        to_char(NEW.amount, 'FM999G999G990D00'),
        NEW.currency,
        COALESCE(' · ' || NEW.message, '')
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS apply_transaction_trigger ON public.transactions;
CREATE TRIGGER apply_transaction_trigger
AFTER INSERT ON public.transactions
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION public.apply_transaction();

-- Updated-at touch on profiles.
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
