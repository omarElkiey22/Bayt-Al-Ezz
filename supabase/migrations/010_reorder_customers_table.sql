-- Migration: Clean & Reorder Columns of Customers Table
-- Grouping columns logically: Identification -> Personal Data (name, phone, address) -> Debt -> Timestamps

BEGIN;

CREATE TABLE public.customers_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  phone VARCHAR,
  address TEXT,
  total_debt NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

INSERT INTO public.customers_new (
  id, name, phone, address, total_debt, created_at, deleted_at
)
SELECT 
  id, name, phone, address, COALESCE(total_debt, 0), created_at, deleted_at
FROM public.customers;

DROP TABLE public.customers CASCADE;
ALTER TABLE public.customers_new RENAME TO customers;

CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_deleted ON public.customers(created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;

CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
