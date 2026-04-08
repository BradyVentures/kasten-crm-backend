CREATE TABLE saved_line_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    default_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
    category        VARCHAR(50) NOT NULL DEFAULT 'allgemein',
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_line_items_category ON saved_line_items(category);

-- Seed some common line items
INSERT INTO saved_line_items (name, description, default_price, category, sort_order) VALUES
    ('Standardmontage', 'Montage inkl. Befestigungsmaterial', 120.00, 'allgemein', 1),
    ('Montageaufpreis 2. OG', 'Aufpreis fuer Montage im 2. Obergeschoss', 80.00, 'allgemein', 2),
    ('Montageaufpreis schwer zugaenglich', 'Aufpreis bei erschwertem Zugang zur Baustelle', 150.00, 'allgemein', 3),
    ('Demontage Altanlage', 'Demontage und Entsorgung der bestehenden Anlage', 85.00, 'allgemein', 4),
    ('Anfahrtspauschale', 'Anfahrt und Rueckfahrt', 45.00, 'allgemein', 5),
    ('Elektro-Anschluss', 'Elektrischer Anschluss fuer Motorantrieb', 95.00, 'rolllaeden', 6),
    ('Putzschiene', 'Putzanschlussschiene fuer sauberen Abschluss', 25.00, 'rolllaeden', 7),
    ('Regenrinne', 'Integrierte Regenrinne mit Fallrohr', 180.00, 'terrassendaecher', 8),
    ('Seitenteil Glas', 'Seitliche Glaswand als Windschutz', 350.00, 'terrassendaecher', 9);
