CREATE TABLE document_comparisons (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_a_id   UUID NOT NULL REFERENCES project_documents(id),
    document_b_id   UUID NOT NULL REFERENCES project_documents(id),
    comparison_type VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    summary         TEXT,
    differences     JSONB,
    match_score     DECIMAL(5,2),
    created_by      UUID NOT NULL REFERENCES users(id),
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_comparisons_project ON document_comparisons(project_id);
