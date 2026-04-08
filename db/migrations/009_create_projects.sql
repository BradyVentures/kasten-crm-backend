CREATE TYPE project_status AS ENUM (
  'messung', 'angebot_erstellt', 'angebot_gesendet',
  'angebot_angenommen', 'angebot_abgelehnt',
  'in_bearbeitung', 'abgeschlossen', 'storniert'
);

CREATE TYPE project_category AS ENUM ('rolllaeden', 'terrassendaecher', 'fenster');

CREATE TABLE projects (
    id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_number              VARCHAR(50) UNIQUE NOT NULL,
    customer_id                 UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    category                    project_category NOT NULL,
    title                       VARCHAR(255) NOT NULL,
    status                      project_status NOT NULL DEFAULT 'messung',
    notes                       TEXT,
    measurement_date            DATE,
    assigned_to                 UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by                  UUID NOT NULL REFERENCES users(id),
    manufacturer_margin_percent DECIMAL(5,2) DEFAULT 0,
    installation_cost           DECIMAL(12,2) DEFAULT 0,
    offer_created_at            TIMESTAMPTZ,
    offer_sent_at               TIMESTAMPTZ,
    offer_accepted_at           TIMESTAMPTZ,
    offer_declined_at           TIMESTAMPTZ,
    completed_at                TIMESTAMPTZ,
    cancelled_at                TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_customer ON projects(customer_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_assigned ON projects(assigned_to);
CREATE INDEX idx_projects_category ON projects(category);

CREATE SEQUENCE project_number_seq START 1001;
CREATE OR REPLACE FUNCTION next_project_number() RETURNS VARCHAR AS $$
  SELECT 'P-' || LPAD(nextval('project_number_seq')::TEXT, 5, '0');
$$ LANGUAGE SQL;
