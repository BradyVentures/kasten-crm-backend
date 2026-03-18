-- Replace website_status (enum text) with website_rating (1-10 integer)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website_rating INTEGER CHECK (website_rating >= 1 AND website_rating <= 10);

-- Migrate existing data
UPDATE leads SET website_rating = CASE website_status
  WHEN 'keine' THEN 1
  WHEN 'veraltet' THEN 3
  WHEN 'einfach' THEN 5
  WHEN 'ok' THEN 7
  ELSE NULL
END
WHERE website_status IS NOT NULL AND website_status != 'unbekannt';

-- Drop old column
ALTER TABLE leads DROP COLUMN IF EXISTS website_status;
