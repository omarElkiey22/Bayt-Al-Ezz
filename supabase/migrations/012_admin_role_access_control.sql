-- Migration: Real admin gating for RLS (fixes /cso Finding #1)
--
-- Every write policy so far (and the invoices read policy) used
-- `TO authenticated USING (auth.role() = 'authenticated')`, which is true
-- for ANY signed-up Supabase Auth user -- there was no admin-specific check
-- anywhere in the schema. Since Supabase projects allow self-service email
-- sign-up by default, and the anon key is necessarily public, this meant
-- any internet visitor who created an account got full read/write on
-- customer PII, invoices, products, sections, settings, and the asset
-- storage bucket.
--
-- This migration introduces a real admins table plus a SECURITY DEFINER
-- helper function, and re-points every sensitive policy at it.

BEGIN;

-- 1. Admins table. RLS is enabled with NO policies attached on purpose:
--    it is only ever read through public.is_admin() (which runs with the
--    function owner's privileges, bypassing this table's RLS), so it can
--    never be queried directly by anon or authenticated roles -- that
--    also stops anyone from enumerating who the admins are.
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 2. Helper function: SECURITY DEFINER so it can read public.admins
--    regardless of the calling user's RLS visibility into that table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Re-gate every sensitive write (and the invoices read) policy behind
--    public.is_admin() instead of the bare authenticated-role check.
DROP POLICY IF EXISTS "merchant settings writes" ON public.merchant_settings;
CREATE POLICY "merchant settings writes" ON public.merchant_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "merchant sections writes" ON public.sections;
CREATE POLICY "merchant sections writes" ON public.sections
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "merchant products writes" ON public.products;
CREATE POLICY "merchant products writes" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "merchant variants writes" ON public.product_variants;
CREATE POLICY "merchant variants writes" ON public.product_variants
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "merchant invoices readable" ON public.invoices;
CREATE POLICY "merchant invoices readable" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.is_admin() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "merchant invoices writes" ON public.invoices;
CREATE POLICY "merchant invoices writes" ON public.invoices
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
CREATE POLICY "Admins can manage customers" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "merchant asset write" ON storage.objects;
CREATE POLICY "merchant asset write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'store-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'store-assets' AND public.is_admin());

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────
-- MANUAL FOLLOW-UP REQUIRED -- this migration alone does not make you an
-- admin again. After applying it:
--
-- 1. Find your own auth.users id (Supabase Dashboard -> Authentication ->
--    Users, or `select id from auth.users where email = 'you@example.com';`
--    in the SQL editor).
-- 2. Grant yourself admin access:
--      insert into public.admins (user_id) values ('<paste-your-uid-here>');
-- 3. In the Dashboard, go to Authentication -> Providers -> Email and turn
--    OFF "Allow new users to sign up" (or restrict to your own domain) --
--    this app has no legitimate self-registration flow, so it should not
--    be reachable at all, in addition to the RLS fix above.
-- ─────────────────────────────────────────────────────────────────────────
