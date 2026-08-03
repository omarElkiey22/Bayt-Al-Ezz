-- Migration: Add payment breakdown and customer debt tracking
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS paid_amount INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS remaining_amount INTEGER DEFAULT 0;

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS total_debt INTEGER DEFAULT 0;
