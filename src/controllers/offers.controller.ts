import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as offersService from '../services/offers.service.js';

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const result = await offersService.getAll({
      search: req.query.search as string,
      status: req.query.status as string,
      customer_id: req.query.customer_id as string,
      page: parseInt(req.query.page as string) || 1,
      per_page: parseInt(req.query.per_page as string) || 50,
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Angebote' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    if (!req.body.customer_name) {
      res.status(400).json({ error: 'Kundenname erforderlich' }); return;
    }
    const offer = await offersService.create(req.body, req.user!.id);
    res.status(201).json(offer);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Angebots' });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const offer = await offersService.getById(req.params.id);
    if (!offer) { res.status(404).json({ error: 'Angebot nicht gefunden' }); return; }
    res.json(offer);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Angebots' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const offer = await offersService.update(req.params.id, req.body);
    if (!offer) { res.status(404).json({ error: 'Angebot nicht gefunden' }); return; }
    res.json(offer);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Angebots' });
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const { status } = req.body;
    const validStatuses = ['entwurf', 'gesendet', 'angenommen', 'abgelehnt'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Ungueltiger Status' }); return;
    }
    const offer = await offersService.updateStatus(req.params.id, status);
    if (!offer) { res.status(404).json({ error: 'Angebot nicht gefunden' }); return; }
    res.json(offer);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aendern des Status' });
  }
}

export async function addItem(req: AuthRequest, res: Response) {
  try {
    const item = await offersService.addItem(req.params.id, req.body);
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: 'Fehler beim Hinzufuegen der Position' });
  }
}

export async function updateItem(req: AuthRequest, res: Response) {
  try {
    const item = await offersService.updateItem(req.params.id, req.params.itemId, req.body);
    if (!item) { res.status(404).json({ error: 'Position nicht gefunden' }); return; }
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Position' });
  }
}

export async function removeItem(req: AuthRequest, res: Response) {
  try {
    const item = await offersService.removeItem(req.params.id, req.params.itemId);
    if (!item) { res.status(404).json({ error: 'Position nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Entfernen der Position' });
  }
}

export async function deleteOffer(req: AuthRequest, res: Response) {
  try {
    const deleted = await offersService.deleteOffer(req.params.id);
    if (!deleted) { res.status(404).json({ error: 'Angebot nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Loeschen des Angebots' });
  }
}

export async function duplicateOffer(req: AuthRequest, res: Response) {
  try {
    const offer = await offersService.duplicate(req.params.id, req.user!.id);
    if (!offer) { res.status(404).json({ error: 'Angebot nicht gefunden' }); return; }
    res.status(201).json(offer);
  } catch {
    res.status(500).json({ error: 'Fehler beim Duplizieren des Angebots' });
  }
}

export async function generatePdf(req: AuthRequest, res: Response) {
  try {
    const offer = await offersService.getById(req.params.id);
    if (!offer) { res.status(404).json({ error: 'Angebot nicht gefunden' }); return; }

    const { generateOfferPdf } = await import('../services/pdf.service.js');
    const pdfBuffer = await generateOfferPdf(offer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${offer.offer_number}.pdf"`);
    res.send(pdfBuffer);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des PDF' });
  }
}
