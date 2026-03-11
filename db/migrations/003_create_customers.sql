CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID UNIQUE REFERENCES leads(id) ON DELETE SET NULL,
    company_name    VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    email           VARCHAR(255),
    phone           VARCHAR(100),
    website         VARCHAR(500),
    address         TEXT,
    city            VARCHAR(255),
    postal_code     VARCHAR(20),
    notes           TEXT,
    assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
    converted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    converted_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_assigned ON customers(assigned_to);
