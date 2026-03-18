-- Email Templates for Info Center
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category VARCHAR(100) NOT NULL DEFAULT 'Allgemein',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_templates_category ON email_templates(category);

-- Seed: Standard-Vorlagen
INSERT INTO email_templates (title, subject, body, category, sort_order) VALUES

-- Akquise & Erstkontakt
('Erstkontakt nach Website-Check', 'Ihre Website – Potenzial für mehr Sichtbarkeit', 'Sehr geehrte/r {kontaktperson},

mein Name ist {mein_name} von Brady Digital. Ich habe mir Ihre Website ({website}) angesehen und einige interessante Optimierungsmöglichkeiten entdeckt.

Konkret ist mir aufgefallen:
- {punkt_1}
- {punkt_2}
- {punkt_3}

Ich würde Ihnen gerne in einem kurzen Gespräch (ca. 15 Min.) zeigen, wie wir {firmenname} dabei unterstützen können, online besser gefunden zu werden.

Haben Sie diese Woche noch Zeit für ein kurzes Telefonat?

Mit freundlichen Grüßen
{mein_name}
Brady Digital GmbH', 'Akquise & Erstkontakt', 1),

('Follow-up nach Anruf', 'Zusammenfassung unseres Gesprächs – {firmenname}', 'Sehr geehrte/r {kontaktperson},

vielen Dank für das angenehme Gespräch heute. Wie besprochen fasse ich die wichtigsten Punkte zusammen:

{zusammenfassung}

Als nächste Schritte hatten wir vereinbart:
- {naechster_schritt}

Ich melde mich am {datum} wieder bei Ihnen. Falls Sie vorher Fragen haben, erreichen Sie mich jederzeit.

Beste Grüße
{mein_name}
Brady Digital GmbH', 'Akquise & Erstkontakt', 2),

('Nachfassen – Keine Rückmeldung', 'Kurze Rückfrage – {firmenname}', 'Sehr geehrte/r {kontaktperson},

ich hatte mich vor einiger Zeit bei Ihnen gemeldet bezüglich {thema}. Ich wollte kurz nachfragen, ob das Thema für Sie noch relevant ist.

Falls ja, stehe ich gerne für ein kurzes Gespräch zur Verfügung. Falls der Zeitpunkt gerade nicht passt, melde ich mich auch gerne zu einem späteren Zeitpunkt wieder.

Beste Grüße
{mein_name}
Brady Digital GmbH', 'Akquise & Erstkontakt', 3),

-- Angebot & Verhandlung
('Angebot zusenden', 'Ihr individuelles Angebot – {firmenname}', 'Sehr geehrte/r {kontaktperson},

wie besprochen sende ich Ihnen unser Angebot für {firmenname}:

**{service_name}**
- Leistungsumfang: {leistungen}
- Investition: {preis}
- Laufzeit: {laufzeit}

{zusatz_info}

Das Angebot ist gültig bis zum {gueltig_bis}. Ich freue mich auf Ihre Rückmeldung und beantworte gerne offene Fragen.

Mit freundlichen Grüßen
{mein_name}
Brady Digital GmbH', 'Angebot & Verhandlung', 1),

('Angebot nachfassen', 'Rückfrage zu unserem Angebot – {firmenname}', 'Sehr geehrte/r {kontaktperson},

ich wollte mich kurz erkundigen, ob Sie unser Angebot vom {datum} erhalten haben und ob es noch offene Fragen gibt.

Gerne können wir das Angebot auch in einem kurzen Telefonat durchgehen. Wann passt es Ihnen am besten?

Beste Grüße
{mein_name}
Brady Digital GmbH', 'Angebot & Verhandlung', 2),

-- Kundenbeziehung
('Willkommen als Kunde', 'Willkommen bei Brady Digital – {firmenname}', 'Sehr geehrte/r {kontaktperson},

herzlich willkommen bei Brady Digital! Wir freuen uns sehr, {firmenname} als neuen Kunden begrüßen zu dürfen.

Ihr Ansprechpartner für alle Fragen bin ich, {mein_name}. Sie erreichen mich unter:
- E-Mail: {meine_email}
- Telefon: {meine_telefon}

Als nächstes werden wir:
1. {schritt_1}
2. {schritt_2}
3. {schritt_3}

Ich melde mich in den nächsten Tagen bei Ihnen, um die Details zu besprechen.

Beste Grüße
{mein_name}
Brady Digital GmbH', 'Kundenbeziehung', 1),

('Terminbestätigung', 'Terminbestätigung – {datum} um {uhrzeit}', 'Sehr geehrte/r {kontaktperson},

hiermit bestätige ich unseren Termin:

📅 Datum: {datum}
🕐 Uhrzeit: {uhrzeit}
📍 Ort/Format: {ort}

{agenda}

Falls Sie den Termin verschieben müssen, geben Sie mir bitte kurz Bescheid.

Bis dahin, beste Grüße
{mein_name}
Brady Digital GmbH', 'Kundenbeziehung', 2);
