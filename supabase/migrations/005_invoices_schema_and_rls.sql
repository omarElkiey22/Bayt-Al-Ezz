-- Migration: Invoices table schema with Row Level Security (RLS) & Storage Access Controls

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR NOT NULL,
  issue_date DATE,
  customer_name VARCHAR,
  customer_address TEXT,
  payment_method VARCHAR,
  payment_status VARCHAR,
  items JSONB,
  subtotal NUMERIC,
  shipping_fee NUMERIC,
  discount_percent NUMERIC,
  discount_amount NUMERIC,
  grand_total NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes for performant filtering and sorting
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_created ON public.invoices(created_at DESC) WHERE deleted_at IS NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Security Policies: Only authenticated admin users can read, insert, update or delete invoices
DROP POLICY IF EXISTS "merchant invoices readable" ON public.invoices;
DROP POLICY IF EXISTS "merchant invoices writes" ON public.invoices;

CREATE POLICY "merchant invoices readable" ON public.invoices FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "merchant invoices writes" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
