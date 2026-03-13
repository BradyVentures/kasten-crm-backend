-- Add branche (industry) and website_status columns to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS branche VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website_status VARCHAR(50);
-- website_status: 'keine', 'veraltet', 'einfach', 'ok', 'unbekannt'

COMMENT ON COLUMN leads.branche IS 'Branche des Unternehmens, z.B. Friseur, Handwerk, Gastronomie';
COMMENT ON COLUMN leads.website_status IS 'Status der Website: keine, veraltet, einfach, ok, unbekannt';
