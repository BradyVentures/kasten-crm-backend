CREATE TYPE lead_status AS ENUM (
    'neu',
    'kontaktiert',
    'qualifiziert',
    'angebot',
    'gewonnen',
    'verloren'
);

CREATE TABLE leads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name    VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    email           VARCHAR(255),
    phone           VARCHAR(100),
    website         VARCHAR(500),
    address         TEXT,
    city            VARCHAR(255),
    postal_code     VARCHAR(20),
    status          lead_status NOT NULL DEFAULT 'neu',
    assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
    source          VARCHAR(255),
    notes           TEXT,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
