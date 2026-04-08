CREATE TYPE document_type AS ENUM (
  'hersteller_angebot', 'kunden_angebot', 'auftragsbestaetigung',
  'rechnung', 'foto', 'sonstiges'
);

CREATE TABLE project_documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_type   document_type NOT NULL DEFAULT 'sonstiges',
    filename        VARCHAR(500) NOT NULL,
    original_name   VARCHAR(500) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    file_size       INTEGER NOT NULL,
    storage_path    TEXT NOT NULL,
    extracted_data  JSONB,
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_documents_project ON project_documents(project_id);
CREATE INDEX idx_project_documents_type ON project_documents(document_type);
