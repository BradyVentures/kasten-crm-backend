-- Project Management Module

-- Enums
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'entwurf', 'angebot', 'verhandlung', 'beauftragt',
    'in_umsetzung', 'live', 'pausiert', 'abgebrochen'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE module_category AS ENUM (
    'crm', 'ki_chatbot', 'ki_telefon', 'automatisierung',
    'routenplanung', 'website', 'seo_marketing', 'analytics', 'sonstiges'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE complexity_level AS ENUM ('niedrig', 'mittel', 'hoch');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE module_status AS ENUM ('geplant', 'in_arbeit', 'fertig', 'pausiert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_document_type AS ENUM (
    'briefing', 'angebot', 'vertrag', 'av_vertrag',
    'kalkulation', 'statusbericht', 'technische_doku'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_activity_type AS ENUM (
    'erstellt', 'status_aenderung', 'modul_hinzugefuegt', 'modul_aktualisiert',
    'dokument_erstellt', 'notiz', 'meeting', 'kalkulation_aktualisiert'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  prospect_name VARCHAR(255),
  prospect_contact VARCHAR(255),
  prospect_email VARCHAR(255),
  prospect_phone VARCHAR(100),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'entwurf',
  estimated_start DATE,
  estimated_end DATE,
  actual_start DATE,
  actual_end DATE,
  total_setup_cost_internal DECIMAL(10,2) DEFAULT 0,
  total_setup_price_customer DECIMAL(10,2) DEFAULT 0,
  total_monthly_cost_internal DECIMAL(10,2) DEFAULT 0,
  total_monthly_price_customer DECIMAL(10,2) DEFAULT 0,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_assigned ON projects(assigned_to);

-- 2. Project Modules
CREATE TABLE IF NOT EXISTS project_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category module_category NOT NULL,
  setup_cost_internal DECIMAL(10,2) DEFAULT 0,
  setup_price_customer DECIMAL(10,2) DEFAULT 0,
  monthly_cost_internal DECIMAL(10,2) DEFAULT 0,
  monthly_price_customer DECIMAL(10,2) DEFAULT 0,
  estimated_hours INTEGER,
  complexity complexity_level DEFAULT 'mittel',
  phase INTEGER DEFAULT 1,
  estimated_weeks INTEGER,
  status module_status NOT NULL DEFAULT 'geplant',
  sort_order INTEGER DEFAULT 0,
  tech_stack TEXT,
  dependencies TEXT,
  risks TEXT,
  dsgvo_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_modules_project ON project_modules(project_id);

-- 3. Project Documents
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type project_document_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  template_data JSONB,
  generated_html TEXT,
  file_path VARCHAR(500),
  file_size INTEGER,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);

-- 4. Project Activities
CREATE TABLE IF NOT EXISTS project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type project_activity_type NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_activities_project ON project_activities(project_id, created_at DESC);

-- 5. Project Templates
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  modules_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: Standard KI-Assist + CRM Paket Vorlage
INSERT INTO project_templates (name, description, modules_json) VALUES (
  'Standard KI-Assist + CRM Paket',
  'Komplettpaket: Custom CRM, KI-Chatbot, KI-Telefon, Automatisierung, Routenplanung, Offline-PWA',
  '[
    {"name":"Custom CRM Grundsystem","category":"crm","description":"Dashboard, Lead-Pipeline, Kunden-Verwaltung, Team-Rollen, Multi-Tenant","setup_cost_internal":0,"setup_price_customer":3500,"monthly_cost_internal":15,"monthly_price_customer":199,"estimated_hours":80,"complexity":"mittel","phase":1,"estimated_weeks":3,"tech_stack":"Next.js 14, Express, PostgreSQL, Hetzner","dsgvo_notes":"Alle Daten auf Hetzner Deutschland"},
    {"name":"KI-Chatbot","category":"ki_chatbot","description":"24/7 Website-Chatbot mit firmenspezifischem Wissen, Lead-Erfassung, CRM-Anbindung","setup_cost_internal":0,"setup_price_customer":349,"monthly_cost_internal":15,"monthly_price_customer":49,"estimated_hours":20,"complexity":"mittel","phase":1,"estimated_weeks":1,"tech_stack":"Claude API (AWS Bedrock EU), Widget (React)","dsgvo_notes":"Claude via AWS Bedrock Frankfurt, AV-Vertrag vorhanden"},
    {"name":"KI-Telefonassistent","category":"ki_telefon","description":"Automatische Telefonannahme, natürliche Sprache, Terminbuchung, Eskalation","setup_cost_internal":0,"setup_price_customer":499,"monthly_cost_internal":50,"monthly_price_customer":299,"estimated_hours":60,"complexity":"hoch","phase":2,"estimated_weeks":3,"tech_stack":"LiveKit, Deepgram EU, Azure TTS Germany, TENIOS SIP","risks":"Latenz-Optimierung (Ziel: 1.2-1.8s)","dsgvo_notes":"TENIOS Nürnberg, Deepgram EU-Endpoint, Azure Germany West Central"},
    {"name":"Angebots-Automatisierung","category":"automatisierung","description":"Kleinanzeigen-Anfragen → KI-Extraktion → Angebots-PDF → E-Mail-Versand","setup_cost_internal":0,"setup_price_customer":599,"monthly_cost_internal":10,"monthly_price_customer":0,"estimated_hours":30,"complexity":"mittel","phase":2,"estimated_weeks":2,"tech_stack":"n8n (self-hosted Hetzner), Claude API, Puppeteer","risks":"Kleinanzeigen hat keine offene API — E-Mail-Parsing nötig","dsgvo_notes":"n8n self-hosted auf Hetzner, kein US-Dienst"},
    {"name":"Routenplanung","category":"routenplanung","description":"Tagesbestellungen auf Karte, optimierte Routen, Fahrer-Zuweisung","setup_cost_internal":0,"setup_price_customer":499,"monthly_cost_internal":10,"monthly_price_customer":0,"estimated_hours":40,"complexity":"mittel","phase":3,"estimated_weeks":2,"tech_stack":"Google OR Tools, Geoapify (DE), Leaflet Maps","dsgvo_notes":"Geoapify ist deutsches Unternehmen, OR Tools lokal"},
    {"name":"Offline-Modus (PWA)","category":"crm","description":"CRM funktioniert ohne Internet — lokale DB, Sync-Queue, Service Worker","setup_cost_internal":0,"setup_price_customer":0,"monthly_cost_internal":0,"monthly_price_customer":0,"estimated_hours":20,"complexity":"hoch","phase":3,"estimated_weeks":1,"tech_stack":"Serwist (Service Worker), Dexie (IndexedDB), SyncEngine","dsgvo_notes":"Daten werden nur lokal im Browser des Nutzers gecacht"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;
