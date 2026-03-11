CREATE TABLE lead_locks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID UNIQUE NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    locked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes')
);

CREATE INDEX idx_locks_lead ON lead_locks(lead_id);
CREATE INDEX idx_locks_expires ON lead_locks(expires_at);
