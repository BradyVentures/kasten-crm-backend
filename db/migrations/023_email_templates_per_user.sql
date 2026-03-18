-- Make email templates user-specific
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Remove global seed data (will be re-seeded per user on first access)
DELETE FROM email_templates WHERE user_id IS NULL;

-- Make user_id NOT NULL
ALTER TABLE email_templates ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX idx_email_templates_user_id ON email_templates(user_id);
