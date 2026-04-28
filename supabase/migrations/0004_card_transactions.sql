-- Phase 6 fix: add card_deposit and card_withdraw transaction types so the
-- card-funded deposit/withdrawal flows can record transactions with their
-- own dedicated type instead of overloading 'deposit'/'withdraw'.

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_type_check CHECK (type IN (
    'send',
    'receive',
    'merchant',
    'bill',
    'topup',
    'deposit',
    'withdraw',
    'remittance',
    'convert',
    'card_deposit',
    'card_withdraw'
  ));
