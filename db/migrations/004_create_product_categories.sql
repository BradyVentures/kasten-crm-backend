CREATE TABLE product_categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        VARCHAR(50) UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_attributes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    slug            VARCHAR(100) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    attribute_type  VARCHAR(20) NOT NULL CHECK (attribute_type IN ('select', 'number', 'boolean', 'text')),
    unit            VARCHAR(20),
    is_required     BOOLEAN NOT NULL DEFAULT false,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(category_id, slug)
);

CREATE TABLE product_attribute_options (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attribute_id    UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
    value           VARCHAR(255) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    price_modifier  DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_default      BOOLEAN NOT NULL DEFAULT false,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_attributes_category ON product_attributes(category_id);
CREATE INDEX idx_product_attr_options_attr ON product_attribute_options(attribute_id);
