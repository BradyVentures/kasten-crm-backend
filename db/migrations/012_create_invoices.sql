CREATE TYPE invoice_status AS ENUM ('entwurf', 'gesendet', 'bezahlt', 'storniert');

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number  VARCHAR(50) UNIQUE NOT NULL,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    offer_id        UUID REFERENCES offers(id) ON DELETE SET NULL,
    customer_id     UUID NOT NULL REFERENCES customers(id),
    customer_name   VARCHAR(255) NOT NULL,
    customer_address TEXT,
    customer_email  VARCHAR(255),
    status          invoice_status NOT NULL DEFAULT 'entwurf',
    notes           TEXT,
    net_total       DECIMAL(12,2) NOT NULL DEFAULT 0,
    vat_rate        DECIMAL(5,2) NOT NULL DEFAULT 19.00,
    vat_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    gross_total     DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_note   VARCHAR(255),
    payment_terms   TEXT DEFAULT 'Zahlbar innerhalb von 14 Tagen',
    sent_at         TIMESTAMPTZ,
    paid_at         TIMESTAMPTZ,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description     VARCHAR(500) NOT NULL,
    quantity        INTEGER NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL,
    total_price     DECIMAL(12,2) NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

CREATE SEQUENCE invoice_number_seq START 1001;
CREATE OR REPLACE FUNCTION next_invoice_number() RETURNS VARCHAR AS $$
  SELECT 'R-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
$$ LANGUAGE SQL;
