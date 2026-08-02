-- Migration: Add wholesale_price column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS wholesale_price INTEGER CHECK(wholesale_price >= 0);
