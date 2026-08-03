-- Migration: Clean & Reorder Columns of Invoices Table
-- Grouping columns logically: Identification -> Customer -> Payment & Status -> Financial Breakdown -> Notes & Timestamps

BEGIN;

CREATE TABLE public.invoices_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR NOT NULL,
  issue_date DATE NOT NULL,
  customer_name VARCHAR,
  customer_phone VARCHAR,
  customer_address TEXT,
  payment_method VARCHAR DEFAULT 'كاش عند الاستلام',
  payment_status VARCHAR DEFAULT 'مدفوع بالكامل',
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC DEFAULT 0,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  shipping_fee NUMERIC DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

INSERT INTO public.invoices_new (
  id, invoice_number, issue_date, customer_name, customer_phone, customer_address,
  payment_method, payment_status, paid_amount, remaining_amount, items,
  subtotal, shipping_fee, discount_percent, discount_amount, grand_total,
  notes, created_at, deleted_at
)
SELECT 
  id, invoice_number, issue_date, customer_name, customer_phone, customer_address,
  payment_method, payment_status, paid_amount, remaining_amount, items,
  subtotal, shipping_fee, discount_percent, discount_amount, grand_total,
  notes, created_at, deleted_at
FROM public.invoices;

DROP TABLE public.invoices CASCADE;
ALTER TABLE public.invoices_new RENAME TO invoices;

CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_deleted_created ON public.invoices(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_customer_name ON public.invoices(customer_name);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "merchant invoices readable" ON public.invoices;
DROP POLICY IF EXISTS "merchant invoices writes" ON public.invoices;

CREATE POLICY "merchant invoices readable" ON public.invoices FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "merchant invoices writes" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

COMMIT;
