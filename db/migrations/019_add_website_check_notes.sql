-- Add website_check_notes text field to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website_check_notes TEXT DEFAULT '';
