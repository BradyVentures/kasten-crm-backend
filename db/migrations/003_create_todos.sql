CREATE TABLE todos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       VARCHAR(500) NOT NULL,
    description TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'offen' CHECK (status IN ('offen', 'erledigt')),
    due_date    DATE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    offer_id    UUID,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_customer ON todos(customer_id);
CREATE INDEX idx_todos_assigned ON todos(assigned_to);
CREATE INDEX idx_todos_due ON todos(due_date);
