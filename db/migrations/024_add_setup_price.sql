-- Migration 024: Add setup_price to services and customer_services
-- Allows one-time setup fees in addition to recurring base_price

-- Add setup_price to services (template/catalog price)
ALTER TABLE services ADD COLUMN IF NOT EXISTS setup_price DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Add setup_price to customer_services (actual charged setup fee, can differ from catalog)
ALTER TABLE customer_services ADD COLUMN IF NOT EXISTS setup_price DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Update existing KI services with setup prices
UPDATE services SET setup_price = 899.00 WHERE name = 'KI-Chatbot' AND is_active = true;
UPDATE services SET setup_price = 899.00 WHERE name = 'KI-Telefonassistent' AND is_active = true;

-- Insert KI-Assist Komplett-Paket (Chat + Telefon Kombi)
INSERT INTO services (name, short_description, description, includes, base_price, setup_price, price_model, type, category, sort_order)
VALUES (
  'KI-Assist Komplett-Paket',
  'Chatbot + Telefonassistent im Bundle — günstiger als einzeln.',
  'Das Rundum-Paket für maximale Erreichbarkeit: Ihr KI-Chatbot beantwortet Website-Anfragen rund um die Uhr, während der KI-Telefonassistent verpasste Anrufe auffängt, Fragen beantwortet und Rückrufwünsche aufnimmt. Beide Systeme greifen auf dieselbe Wissensdatenbank zu und arbeiten nahtlos zusammen. Alle Anfragen landen zentral in einem Dashboard.',
  'KI-Chatbot (unbegrenzte Gespräche), KI-Telefonassistent (eigene Nummer), gemeinsame Wissensdatenbank, E-Mail/SMS-Benachrichtigungen, monatliche Auswertung, Dashboard-Zugang',
  499.00,
  1399.00,
  'monatlich',
  'paket',
  'KI-Workflows',
  299
);
