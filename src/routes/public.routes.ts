import { Router, Request, Response } from 'express';
import { db } from '../config/database.js';

const router = Router();
const ADMIN_USER_ID = '9ec85bc9-3f6a-4cc1-89f8-e911c32530f8';

// Allow cross-origin from brady-digital.com
router.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') { res.status(204).end(); return; }
  next();
});

// Promotion progress
router.get('/promotion-progress', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  try {
    const result = await db.query(
      `SELECT name, current_redemptions, max_redemptions
       FROM promotions
       WHERE is_active = true
         AND name ILIKE '%lets go%'
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      res.json({ taken: 0, total: 10, name: 'Lets Go' });
      return;
    }

    const promo = result.rows[0];
    res.json({
      taken: promo.current_redemptions || 0,
      total: promo.max_redemptions || 10,
      name: promo.name,
    });
  } catch {
    res.json({ taken: 0, total: 10, name: 'Lets Go' });
  }
});

// Contact form submission: creates Lead + sends notification email
router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { type, name, email, website, company, message } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name und E-Mail sind erforderlich.' });
      return;
    }

    const isCheck = type === 'check';
    const source = isCheck ? 'Website-Check' : 'Kontaktformular';
    const companyName = company || name;
    const notes = isCheck
      ? `Website-Check angefragt\nWebsite: ${website || '(nicht angegeben)'}`
      : `Kontaktanfrage\n${message || ''}`;

    // Create lead in database
    const result = await db.query(
      `INSERT INTO leads (company_name, contact_person, email, website, source, notes, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING id`,
      [companyName, name, email, website || null, source, notes, ADMIN_USER_ID]
    );

    const leadId = result.rows[0].id;

    // Log activity
    await db.query(
      `INSERT INTO lead_activities (lead_id, user_id, type, description)
       VALUES ($1, $2, 'erstellt', $3)`,
      [leadId, ADMIN_USER_ID, `Lead erstellt via ${source} (brady-digital.com)`]
    );

    // Send notification email via Brevo
    if (process.env.BREVO_API_KEY) {
      const subject = isCheck
        ? `Website-Check Anfrage von ${name}`
        : `Kontaktanfrage von ${name}`;

      const htmlContent = isCheck
        ? `<h2>Neue Website-Check Anfrage</h2>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>E-Mail:</strong> ${email}</p>
           <p><strong>Website:</strong> ${website || '(nicht angegeben)'}</p>
           <br><p><a href="https://sales.brady-digital.com/leads/${leadId}">Im SalesTool öffnen</a></p>`
        : `<h2>Neue Kontaktanfrage</h2>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>E-Mail:</strong> ${email}</p>
           <p><strong>Unternehmen:</strong> ${company || '(nicht angegeben)'}</p>
           <p><strong>Nachricht:</strong></p>
           <p>${(message || '').replace(/\n/g, '<br>')}</p>
           <br><p><a href="https://sales.brady-digital.com/leads/${leadId}">Im SalesTool öffnen</a></p>`;

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: 'Brady Digital', email: 'noreply@brady-digital.com' },
          to: [{ email: 'hallo@brady-digital.com', name: 'Brady Digital' }],
          subject,
          htmlContent,
        }),
      });
    }

    // Auto-create Todo for Website-Check
    if (isCheck) {
      try {
        await db.query(
          `INSERT INTO todos (title, description, assigned_to, created_by)
           VALUES ($1, $2, $3, $3)`,
          [
            `WebCheck: ${name}`,
            `Website: ${website || '(nicht angegeben)'}\nE-Mail: ${email}\n\nAutomatisch erstellt via brady-digital.com`,
            ADMIN_USER_ID,
          ]
        );
      } catch (todoErr) {
        console.error('Auto-todo creation failed:', todoErr);
      }
    }

    res.json({ success: true, message: 'Anfrage erfolgreich gesendet!' });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Fehler beim Senden. Bitte versuche es erneut.' });
  }
});

export default router;
