-- Phase 4: account_type (personal/negocio) chosen at signup, plus
-- cedula photo URLs (stored as base64 data URLs inline for the demo).
-- Run this in the Supabase SQL editor after 0001 and 0002.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'personal'
    CHECK (account_type IN ('personal', 'negocio')),
  ADD COLUMN IF NOT EXISTS cedula_front_url TEXT,
  ADD COLUMN IF NOT EXISTS cedula_back_url TEXT;

CREATE INDEX IF NOT EXISTS profiles_account_type_idx
  ON public.profiles (account_type);
