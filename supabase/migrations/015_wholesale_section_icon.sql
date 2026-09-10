BEGIN;

ALTER TABLE wholesale_sections
  ADD COLUMN IF NOT EXISTS icon_name varchar;

COMMIT;
