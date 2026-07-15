-- Add length and non-negative constraints
ALTER TABLE public.sections
  ADD CONSTRAINT name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  ADD CONSTRAINT slug_length CHECK (char_length(slug) >= 2 AND char_length(slug) <= 100);

ALTER TABLE public.products
  ADD CONSTRAINT product_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 255),
  ADD CONSTRAINT base_price_positive CHECK (base_price >= 0);

ALTER TABLE public.product_variants
  ADD CONSTRAINT variant_label_length CHECK (char_length(label) >= 1 AND char_length(label) <= 100),
  ADD CONSTRAINT price_override_positive CHECK (price_override >= 0 OR price_override IS NULL);

-- Create function to reject HTML/script tags
CREATE OR REPLACE FUNCTION sanitize_text_trigger()
RETURNS trigger AS $$
BEGIN
  IF NEW.name ~ '<[^>]*>' OR (TG_TABLE_NAME = 'products' AND NEW.description ~ '<[^>]*>') THEN
    RAISE EXCEPTION 'Input contains prohibited HTML or script tags';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sections
CREATE TRIGGER prevent_html_in_sections
  BEFORE INSERT OR UPDATE ON public.sections
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_text_trigger();

-- Apply trigger to products
CREATE TRIGGER prevent_html_in_products
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_text_trigger();
