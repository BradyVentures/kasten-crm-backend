CREATE TABLE email_settings (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    smtp_host                VARCHAR(255) NOT NULL DEFAULT '',
    smtp_port                INTEGER NOT NULL DEFAULT 587,
    smtp_secure              BOOLEAN NOT NULL DEFAULT false,
    smtp_user                VARCHAR(255) NOT NULL DEFAULT '',
    smtp_password            TEXT NOT NULL DEFAULT '',
    from_name                VARCHAR(255) NOT NULL DEFAULT 'Bauelemente Kasten',
    from_email               VARCHAR(255) NOT NULL DEFAULT '',
    offer_subject_template   TEXT DEFAULT 'Ihr Angebot {{angebot_nummer}} von Bauelemente Kasten',
    offer_body_template      TEXT DEFAULT 'Sehr geehrte/r {{kunde_name}},

anbei erhalten Sie unser Angebot {{angebot_nummer}}.

Bei Fragen stehen wir Ihnen gerne zur Verfuegung.

Mit freundlichen Gruessen
Olaf Kasten
Bauelemente Kasten',
    invoice_subject_template TEXT DEFAULT 'Ihre Rechnung {{rechnung_nummer}} von Bauelemente Kasten',
    invoice_body_template    TEXT DEFAULT 'Sehr geehrte/r {{kunde_name}},

anbei erhalten Sie unsere Rechnung {{rechnung_nummer}}.

{{zahlungsbedingungen}}

Mit freundlichen Gruessen
Olaf Kasten
Bauelemente Kasten',
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default row
INSERT INTO email_settings (id) VALUES (uuid_generate_v4());

CREATE TABLE email_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    body            TEXT,
    attachment_type VARCHAR(50),
    attachment_name VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'sent',
    error_message   TEXT,
    sent_by         UUID REFERENCES users(id),
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_log_project ON email_log(project_id);
