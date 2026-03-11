CREATE TYPE service_type AS ENUM ('paket', 'addon');

CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    base_price      DECIMAL(10, 2) NOT NULL,
    price_model     VARCHAR(50) NOT NULL DEFAULT 'einmalig',
    type            service_type NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
