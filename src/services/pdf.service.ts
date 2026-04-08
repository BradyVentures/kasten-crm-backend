import PDFDocument from 'pdfkit';

interface OfferData {
  offer_number: string;
  customer_name: string;
  customer_address: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  status: string;
  notes: string | null;
  valid_until: string | null;
  net_total: number;
  vat_rate: number;
  vat_amount: number;
  gross_total: number;
  discount_amount: number;
  discount_note: string | null;
  created_at: string;
  items: Array<{
    product_name: string;
    description: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export async function generateOfferPdf(offer: OfferData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Company header
    doc.fontSize(20).font('Helvetica-Bold').text('Bauelemente Kasten', { align: 'left' });
    doc.fontSize(9).font('Helvetica')
      .text('Olaf Kasten')
      .text('Schillerstrasse 19, 19258 Boizenburg')
      .text('Tel: 038847 54362 | Mobil: 0172 305 99 21')
      .text('info@bauelemente-kasten.de');

    doc.moveDown(2);

    // Customer block
    doc.fontSize(11).font('Helvetica-Bold').text(offer.customer_name);
    if (offer.customer_address) doc.fontSize(10).font('Helvetica').text(offer.customer_address);
    if (offer.customer_email) doc.text(offer.customer_email);
    if (offer.customer_phone) doc.text(offer.customer_phone);

    doc.moveDown(2);

    // Offer info
    const dateStr = new Date(offer.created_at).toLocaleDateString('de-DE');
    doc.fontSize(16).font('Helvetica-Bold').text(`Angebot ${offer.offer_number}`);
    doc.fontSize(10).font('Helvetica').text(`Datum: ${dateStr}`);
    if (offer.valid_until) {
      doc.text(`Gueltig bis: ${new Date(offer.valid_until).toLocaleDateString('de-DE')}`);
    }

    doc.moveDown(1.5);

    // Items table
    const tableTop = doc.y;
    const col = { pos: 50, name: 80, qty: 350, price: 410, total: 480 };

    // Header
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Pos.', col.pos, tableTop);
    doc.text('Bezeichnung', col.name, tableTop);
    doc.text('Menge', col.qty, tableTop);
    doc.text('Einzelpreis', col.price, tableTop);
    doc.text('Gesamt', col.total, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    let y = tableTop + 22;
    doc.font('Helvetica').fontSize(9);

    offer.items.forEach((item, i) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(`${i + 1}`, col.pos, y, { width: 25 });
      doc.text(item.product_name, col.name, y, { width: 260 });
      const nameHeight = doc.heightOfString(item.product_name, { width: 260 });

      if (item.description) {
        doc.fontSize(8).fillColor('#666666').text(item.description, col.name, y + nameHeight, { width: 260 });
        doc.fillColor('#000000').fontSize(9);
      }

      doc.text(`${item.quantity}`, col.qty, y, { width: 50 });
      doc.text(`${formatEur(item.unit_price)}`, col.price, y, { width: 60 });
      doc.text(`${formatEur(item.total_price)}`, col.total, y, { width: 65 });

      const descHeight = item.description ? doc.heightOfString(item.description, { width: 260 }) : 0;
      y += Math.max(nameHeight + descHeight, 15) + 8;
    });

    // Separator
    doc.moveTo(350, y).lineTo(545, y).stroke();
    y += 10;

    // Totals
    doc.fontSize(10).font('Helvetica');

    if (offer.discount_amount > 0) {
      doc.text('Rabatt:', 350, y);
      doc.text(`-${formatEur(offer.discount_amount)}`, col.total, y);
      if (offer.discount_note) {
        doc.fontSize(8).text(`(${offer.discount_note})`, 350, y + 12);
        doc.fontSize(10);
      }
      y += 25;
    }

    doc.text('Nettobetrag:', 350, y);
    doc.text(formatEur(offer.net_total), col.total, y);
    y += 16;

    doc.text(`MwSt. ${offer.vat_rate}%:`, 350, y);
    doc.text(formatEur(offer.vat_amount), col.total, y);
    y += 16;

    doc.font('Helvetica-Bold');
    doc.text('Gesamtbetrag:', 350, y);
    doc.text(formatEur(offer.gross_total), col.total, y);

    // Notes
    if (offer.notes) {
      y += 40;
      doc.font('Helvetica-Bold').fontSize(10).text('Anmerkungen:', 50, y);
      y += 14;
      doc.font('Helvetica').fontSize(9).text(offer.notes, 50, y, { width: 495 });
    }

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#888888');
    doc.text(
      'Bauelemente Kasten | Olaf Kasten | Schillerstrasse 19 | 19258 Boizenburg',
      50, 770, { align: 'center', width: 495 }
    );

    doc.end();
  });
}

function formatEur(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
