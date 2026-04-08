-- Add project_id to offers
ALTER TABLE offers ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX idx_offers_project ON offers(project_id);

-- Add project_id to todos (if not exists already from earlier migration)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'todos' AND column_name = 'project_id') THEN
    ALTER TABLE todos ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    CREATE INDEX idx_todos_project ON todos(project_id);
  END IF;
END $$;

-- Add is_custom and custom_description to offer_items for Freitext-Positionen
ALTER TABLE offer_items ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE offer_items ADD COLUMN custom_description TEXT;
