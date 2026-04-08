CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_number VARCHAR(50) UNIQUE,
    company_name    VARCHAR(255) NOT NULL,
    contact_person  VARCHAR(255),
    email           VARCHAR(255),
    phone           VARCHAR(100),
    mobile          VARCHAR(100),
    address         TEXT,
    city            VARCHAR(255),
    postal_code     VARCHAR(20),
    notes           TEXT,
    assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_assigned ON customers(assigned_to);
CREATE INDEX idx_customers_number ON customers(customer_number);
CREATE INDEX idx_customers_company ON customers(company_name);
