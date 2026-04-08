CREATE TABLE project_measurements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label           VARCHAR(255),
    width_mm        INTEGER NOT NULL,
    height_mm       INTEGER NOT NULL,
    depth_mm        INTEGER,
    configuration   JSONB NOT NULL DEFAULT '{}',
    photo_path      TEXT,
    notes           TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_measurements_project ON project_measurements(project_id);
