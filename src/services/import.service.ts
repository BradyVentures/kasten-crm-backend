import { db } from '../config/database.js';

interface ImportPreviewRow {
  rowIndex: number;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  confidence: number;
  raw_text: string;
}

export async function parseDocx(buffer: Buffer): Promise<ImportPreviewRow[]> {
  const mammoth = await import('mammoth');
  const result = await mammoth.default.extractRawText({ buffer });
  const text = result.value;

  const blocks = text.split(/\n{2,}/).filter((b: string) => b.trim().length > 10);

  return blocks.map((block: string, index: number) => parseCustomerBlock(block.trim(), index)).filter((row: ImportPreviewRow) => row.company_name !== null);
}

function parseCustomerBlock(text: string, index: number): ImportPreviewRow {
  const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

  const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/;
  const phoneRegex = /(?:Tel|Fon|Telefon|Festnetz)[.:]\s*([\d\s\-+/()]+)/i;
  const mobileRegex = /(?:Mobil|Handy|Funk)[.:]\s*([\d\s\-+/()]+)/i;
  const plzCityRegex = /\b(\d{5})\s+(.+)/;
  const streetRegex = /^(.+(?:str\.|straße|stra(?:ss|ß)e|weg|allee|platz|gasse|ring|damm))\s*\d+/i;

  let company_name: string | null = null;
  let contact_person: string | null = null;
  let email: string | null = null;
  let phone: string | null = null;
  let mobile: string | null = null;
  let address: string | null = null;
  let city: string | null = null;
  let postal_code: string | null = null;
  let confidence = 0;

  // Email
  const emailMatch = text.match(emailRegex);
  if (emailMatch) { email = emailMatch[0]; confidence += 0.2; }

  // Phone
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) { phone = phoneMatch[1].trim(); confidence += 0.15; }

  // Mobile
  const mobileMatch = text.match(mobileRegex);
  if (mobileMatch) { mobile = mobileMatch[1].trim(); confidence += 0.1; }

  // PLZ + City
  for (const line of lines) {
    const plzMatch = line.match(plzCityRegex);
    if (plzMatch) {
      postal_code = plzMatch[1];
      city = plzMatch[2].trim();
      confidence += 0.2;
      break;
    }
  }

  // Address (street)
  for (const line of lines) {
    if (streetRegex.test(line)) {
      address = line;
      confidence += 0.15;
      break;
    }
  }

  // First line is usually the company name
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (!emailRegex.test(firstLine) && !phoneRegex.test(firstLine) && !plzCityRegex.test(firstLine)) {
      company_name = firstLine;
      confidence += 0.2;
    }
  }

  // Second line is often the contact person
  if (lines.length > 1) {
    const secondLine = lines[1];
    if (!emailRegex.test(secondLine) && !phoneRegex.test(secondLine) && !plzCityRegex.test(secondLine) && !streetRegex.test(secondLine)) {
      contact_person = secondLine;
    }
  }

  return {
    rowIndex: index,
    company_name,
    contact_person,
    email,
    phone,
    mobile,
    address,
    city,
    postal_code,
    confidence: Math.min(1, confidence),
    raw_text: text,
  };
}

export async function executeImport(rows: Array<{
  company_name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}>, userId: string) {
  const client = await db.getClient();
  let imported = 0;

  try {
    await client.query('BEGIN');

    for (const row of rows) {
      if (!row.company_name) continue;

      await client.query(
        `INSERT INTO customers (company_name, contact_person, email, phone, mobile, address, city, postal_code, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          row.company_name,
          row.contact_person || null,
          row.email || null,
          row.phone || null,
          row.mobile || null,
          row.address || null,
          row.city || null,
          row.postal_code || null,
          userId,
        ]
      );
      imported++;
    }

    await client.query('COMMIT');
    return { imported, total: rows.length };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
