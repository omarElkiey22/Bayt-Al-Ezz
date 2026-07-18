-- Migration to add sizes and colors arrays to public.products table
ALTER TABLE public.products
  ADD COLUMN sizes text[] DEFAULT '{}'::text[],
  ADD COLUMN colors text[] DEFAULT '{}'::text[];
