import { db } from '../config/database.js';

export async function getStats() {
  const [customerCount, offerStats, monthlyOfferTotal, openTodos] = await Promise.all([
    db.query('SELECT COUNT(*) as count FROM customers'),
    db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'entwurf') AS draft,
        COUNT(*) FILTER (WHERE status = 'gesendet') AS sent,
        COUNT(*) FILTER (WHERE status = 'angenommen') AS accepted,
        COUNT(*) FILTER (WHERE status = 'abgelehnt') AS declined,
        COUNT(*) AS total,
        COALESCE(SUM(gross_total) FILTER (WHERE status = 'angenommen'), 0) AS accepted_total
      FROM offers
    `),
    db.query(`
      SELECT COALESCE(SUM(gross_total), 0) AS total
      FROM offers
      WHERE created_at >= date_trunc('month', CURRENT_DATE)
        AND status != 'abgelehnt'
    `),
    db.query(`SELECT COUNT(*) as count FROM todos WHERE status = 'offen'`),
  ]);

  const stats = offerStats.rows[0];

  return {
    total_customers: parseInt(customerCount.rows[0].count, 10),
    offers_draft: parseInt(stats.draft, 10),
    offers_sent: parseInt(stats.sent, 10),
    offers_accepted: parseInt(stats.accepted, 10),
    offers_declined: parseInt(stats.declined, 10),
    offers_total: parseInt(stats.total, 10),
    accepted_revenue: parseFloat(stats.accepted_total),
    monthly_offer_total: parseFloat(monthlyOfferTotal.rows[0].total),
    open_todos: parseInt(openTodos.rows[0].count, 10),
  };
}

export async function getRecentOffers() {
  const result = await db.query(
    `SELECT o.id, o.offer_number, o.customer_name, o.status, o.gross_total, o.created_at
     FROM offers o
     ORDER BY o.created_at DESC
     LIMIT 10`
  );
  return result.rows;
}
