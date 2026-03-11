CREATE TABLE customer_services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id      UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    sold_price      DECIMAL(10, 2) NOT NULL,
    price_model     VARCHAR(50) NOT NULL DEFAULT 'einmalig',
    sold_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    sold_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cs_customer ON customer_services(customer_id);
CREATE INDEX idx_cs_service ON customer_services(service_id);
