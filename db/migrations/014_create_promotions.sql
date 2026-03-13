-- Aktionen/Promotions system
CREATE TYPE discount_type AS ENUM ('fixed', 'percentage');

CREATE TABLE promotions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    VARCHAR(255) NOT NULL,
    description             TEXT,
    discount_type           discount_type NOT NULL,
    discount_value          DECIMAL(10, 2) NOT NULL,
    valid_from              TIMESTAMPTZ,
    valid_until             TIMESTAMPTZ,
    max_redemptions         INTEGER,
    current_redemptions     INTEGER NOT NULL DEFAULT 0,
    applicable_service_ids  UUID[],
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_percentage CHECK (
        discount_type != 'percentage' OR (discount_value >= 0 AND discount_value <= 100)
    ),
    CONSTRAINT chk_fixed CHECK (
        discount_type != 'fixed' OR discount_value >= 0
    ),
    CONSTRAINT chk_date_range CHECK (
        valid_from IS NULL OR valid_until IS NULL OR valid_from < valid_until
    )
);

CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(valid_from, valid_until);

-- Track promotions on customer_services
ALTER TABLE customer_services ADD COLUMN IF NOT EXISTS promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL;
ALTER TABLE customer_services ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);
ALTER TABLE customer_services ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2);
