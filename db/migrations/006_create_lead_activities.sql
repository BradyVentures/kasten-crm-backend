CREATE TYPE activity_type AS ENUM (
    'anruf',
    'email',
    'status_aenderung',
    'notiz',
    'zuweisung',
    'erstellt',
    'import',
    'konvertiert'
);

CREATE TABLE lead_activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            activity_type NOT NULL,
    description     TEXT,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_lead ON lead_activities(lead_id, created_at DESC);
