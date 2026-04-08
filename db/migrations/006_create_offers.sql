CREATE TYPE offer_status AS ENUM ('entwurf', 'gesendet', 'angenommen', 'abgelehnt');

CREATE TABLE offers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_number    VARCHAR(50) UNIQUE NOT NULL,
    customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name   VARCHAR(255) NOT NULL,
    customer_address TEXT,
    customer_email  VARCHAR(255),
    customer_phone  VARCHAR(100),
    status          offer_status NOT NULL DEFAULT 'entwurf',
    notes           TEXT,
    valid_until     DATE,
    net_total       DECIMAL(12,2) NOT NULL DEFAULT 0,
    vat_rate        DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    vat_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    gross_total     DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_note   VARCHAR(255),
    created_by      UUID NOT NULL REFERENCES users(id),
    sent_at         TIMESTAMPTZ,
    accepted_at     TIMESTAMPTZ,
    declined_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE offer_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id        UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    category_slug   VARCHAR(50) NOT NULL,
    product_name    VARCHAR(255) NOT NULL,
    description     TEXT,
    configuration   JSONB NOT NULL DEFAULT '{}',
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL,
    total_price     DECIMAL(12,2) NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offers_customer ON offers(customer_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_number ON offers(offer_number);
CREATE INDEX idx_offer_items_offer ON offer_items(offer_id);

ALTER TABLE todos ADD CONSTRAINT fk_todos_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL;
