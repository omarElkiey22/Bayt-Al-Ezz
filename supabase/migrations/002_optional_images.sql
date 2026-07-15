-- Drop NOT NULL constraint on primary_image in products table
ALTER TABLE public.products ALTER COLUMN primary_image DROP NOT NULL;

-- Also make sure product_variants image can be NULL just in case
ALTER TABLE public.product_variants ALTER COLUMN image DROP NOT NULL;
