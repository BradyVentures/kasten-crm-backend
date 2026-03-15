-- Add website_checked flag to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website_checked BOOLEAN DEFAULT FALSE;
