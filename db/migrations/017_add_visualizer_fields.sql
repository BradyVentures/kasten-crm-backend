-- Visualizer-Flags für Produktkatalog
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS show_in_visualizer BOOLEAN DEFAULT FALSE;
ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS show_in_visualizer BOOLEAN DEFAULT TRUE;

-- Bestehende Kategorien für Visualizer aktivieren
UPDATE product_categories SET show_in_visualizer = TRUE WHERE slug IN ('rolllaeden', 'terrassendaecher', 'fenster');

-- Visualizer-Bild in Angeboten
ALTER TABLE offers ADD COLUMN IF NOT EXISTS visualizer_image_url TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS visualizer_request_id UUID;
