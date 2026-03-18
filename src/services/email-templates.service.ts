import { db } from '../config/database.js';

const DEFAULT_TEMPLATES = [
  {
    title: 'Erstkontakt nach Website-Check',
    subject: 'Ihre Website – Potenzial für mehr Sichtbarkeit',
    body: `Sehr geehrte/r {kontaktperson},

mein Name ist {mein_name} von Brady Digital. Ich habe mir Ihre Website ({website}) angesehen und einige interessante Optimierungsmöglichkeiten entdeckt.

Konkret ist mir aufgefallen:
- {punkt_1}
- {punkt_2}
- {punkt_3}

Ich würde Ihnen gerne in einem kurzen Gespräch (ca. 15 Min.) zeigen, wie wir {firmenname} dabei unterstützen können, online besser gefunden zu werden.

Haben Sie diese Woche noch Zeit für ein kurzes Telefonat?

Mit freundlichen Grüßen
{mein_name}
Brady Digital GmbH`,
    category: 'Akquise & Erstkontakt',
    sort_order: 1,
  },
  {
    title: 'Follow-up nach Anruf',
    subject: 'Zusammenfassung unseres Gesprächs – {firmenname}',
    body: `Sehr geehrte/r {kontaktperson},

vielen Dank für das angenehme Gespräch heute. Wie besprochen fasse ich die wichtigsten Punkte zusammen:

{zusammenfassung}

Als nächste Schritte hatten wir vereinbart:
- {naechster_schritt}

Ich melde mich am {datum} wieder bei Ihnen. Falls Sie vorher Fragen haben, erreichen Sie mich jederzeit.

Beste Grüße
{mein_name}
Brady Digital GmbH`,
    category: 'Akquise & Erstkontakt',
    sort_order: 2,
  },
  {
    title: 'Nachfassen – Keine Rückmeldung',
    subject: 'Kurze Rückfrage – {firmenname}',
    body: `Sehr geehrte/r {kontaktperson},

ich hatte mich vor einiger Zeit bei Ihnen gemeldet bezüglich {thema}. Ich wollte kurz nachfragen, ob das Thema für Sie noch relevant ist.

Falls ja, stehe ich gerne für ein kurzes Gespräch zur Verfügung. Falls der Zeitpunkt gerade nicht passt, melde ich mich auch gerne zu einem späteren Zeitpunkt wieder.

Beste Grüße
{mein_name}
Brady Digital GmbH`,
    category: 'Akquise & Erstkontakt',
    sort_order: 3,
  },
  {
    title: 'Angebot zusenden',
    subject: 'Ihr individuelles Angebot – {firmenname}',
    body: `Sehr geehrte/r {kontaktperson},

wie besprochen sende ich Ihnen unser Angebot für {firmenname}:

**{service_name}**
- Leistungsumfang: {leistungen}
- Investition: {preis}
- Laufzeit: {laufzeit}

{zusatz_info}

Das Angebot ist gültig bis zum {gueltig_bis}. Ich freue mich auf Ihre Rückmeldung und beantworte gerne offene Fragen.

Mit freundlichen Grüßen
{mein_name}
Brady Digital GmbH`,
    category: 'Angebot & Verhandlung',
    sort_order: 1,
  },
  {
    title: 'Angebot nachfassen',
    subject: 'Rückfrage zu unserem Angebot – {firmenname}',
    body: `Sehr geehrte/r {kontaktperson},

ich wollte mich kurz erkundigen, ob Sie unser Angebot vom {datum} erhalten haben und ob es noch offene Fragen gibt.

Gerne können wir das Angebot auch in einem kurzen Telefonat durchgehen. Wann passt es Ihnen am besten?

Beste Grüße
{mein_name}
Brady Digital GmbH`,
    category: 'Angebot & Verhandlung',
    sort_order: 2,
  },
  {
    title: 'Willkommen als Kunde',
    subject: 'Willkommen bei Brady Digital – {firmenname}',
    body: `Sehr geehrte/r {kontaktperson},

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
Brady Digital GmbH`,
    category: 'Kundenbeziehung',
    sort_order: 1,
  },
  {
    title: 'Terminbestätigung',
    subject: 'Terminbestätigung – {datum} um {uhrzeit}',
    body: `Sehr geehrte/r {kontaktperson},

hiermit bestätige ich unseren Termin:

📅 Datum: {datum}
🕐 Uhrzeit: {uhrzeit}
📍 Ort/Format: {ort}

{agenda}

Falls Sie den Termin verschieben müssen, geben Sie mir bitte kurz Bescheid.

Bis dahin, beste Grüße
{mein_name}
Brady Digital GmbH`,
    category: 'Kundenbeziehung',
    sort_order: 2,
  },
];

async function seedDefaultsForUser(userId: string) {
  for (const t of DEFAULT_TEMPLATES) {
    await db.query(`
      INSERT INTO email_templates (title, subject, body, category, sort_order, user_id, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5, $6, $6, $6)
    `, [t.title, t.subject, t.body, t.category, t.sort_order, userId]);
  }
}

export async function getAll(userId: string) {
  // Check if user has any templates, if not seed defaults
  const countResult = await db.query(
    'SELECT COUNT(*) FROM email_templates WHERE user_id = $1',
    [userId]
  );
  if (parseInt(countResult.rows[0].count) === 0) {
    await seedDefaultsForUser(userId);
  }

  const result = await db.query(`
    SELECT et.*
    FROM email_templates et
    WHERE et.user_id = $1
    ORDER BY et.category, et.sort_order, et.title
  `, [userId]);
  return result.rows;
}

export async function getCategories(userId: string) {
  const result = await db.query(`
    SELECT DISTINCT category FROM email_templates WHERE user_id = $1 ORDER BY category
  `, [userId]);
  return result.rows.map((r: { category: string }) => r.category);
}

export async function create(data: {
  title: string;
  subject?: string;
  body?: string;
  category?: string;
  sort_order?: number;
}, userId: string) {
  const result = await db.query(`
    INSERT INTO email_templates (title, subject, body, category, sort_order, user_id, created_by, updated_by)
    VALUES ($1, $2, $3, $4, $5, $6, $6, $6)
    RETURNING *
  `, [
    data.title,
    data.subject || '',
    data.body || '',
    data.category || 'Allgemein',
    data.sort_order || 0,
    userId,
  ]);
  return result.rows[0];
}

export async function update(id: string, data: Record<string, unknown>, userId: string) {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_by = $${idx}`);
  values.push(userId);
  idx++;

  fields.push(`updated_at = NOW()`);

  values.push(id);
  values.push(userId);

  const result = await db.query(`
    UPDATE email_templates SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *
  `, values);

  return result.rows[0];
}

export async function remove(id: string, userId: string) {
  await db.query('DELETE FROM email_templates WHERE id = $1 AND user_id = $2', [id, userId]);
}
