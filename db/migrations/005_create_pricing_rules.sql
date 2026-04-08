CREATE TABLE pricing_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    rule_type       VARCHAR(30) NOT NULL CHECK (rule_type IN ('base_sqm', 'base_unit', 'size_surcharge', 'attribute_surcharge', 'min_price')),
    attribute_slug  VARCHAR(100),
    option_value    VARCHAR(255),
    min_width       INTEGER,
    max_width       INTEGER,
    min_height      INTEGER,
    max_height      INTEGER,
    price           DECIMAL(10,2) NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pricing_rules_category ON pricing_rules(category_id);
