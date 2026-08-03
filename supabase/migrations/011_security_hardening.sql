-- Migration: Hardened Row Level Security (RLS) Policies
-- Enforces strict auth.role() = 'authenticated' evaluation on write & management operations
-- Completely blocks public anonymous access to customer data & invoices

BEGIN;

-- 1. Customers Table Security Hardening
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
CREATE POLICY "Admins can manage customers" ON public.customers 
  FOR ALL TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- 2. Invoices Table Security Hardening
DROP POLICY IF EXISTS "merchant invoices readable" ON public.invoices;
DROP POLICY IF EXISTS "merchant invoices writes" ON public.invoices;

CREATE POLICY "merchant invoices readable" ON public.invoices 
  FOR SELECT TO authenticated 
  USING (auth.role() = 'authenticated' AND deleted_at IS NULL);

CREATE POLICY "merchant invoices writes" ON public.invoices 
  FOR ALL TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Catalog & Settings Security Hardening
DROP POLICY IF EXISTS "merchant settings writes" ON public.merchant_settings;
CREATE POLICY "merchant settings writes" ON public.merchant_settings 
  FOR ALL TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "merchant variants writes" ON public.product_variants;
CREATE POLICY "merchant variants writes" ON public.product_variants 
  FOR ALL TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "merchant products writes" ON public.products;
CREATE POLICY "merchant products writes" ON public.products 
  FOR ALL TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "merchant sections writes" ON public.sections;
CREATE POLICY "merchant sections writes" ON public.sections 
  FOR ALL TO authenticated 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

COMMIT;
