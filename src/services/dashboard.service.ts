import { db } from '../config/database.js';

export async function getStats() {
  const [statusCounts, conversionRate, totalRevenue, monthlyRevenue] = await Promise.all([
    db.query('SELECT status, COUNT(*) as count FROM leads GROUP BY status'),
    db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'gewonnen') AS won,
        COUNT(*) AS total,
        ROUND(COUNT(*) FILTER (WHERE status = 'gewonnen')::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS rate
      FROM leads
    `),
    db.query('SELECT COALESCE(SUM(sold_price), 0) AS total FROM customer_services'),
    db.query(`
      SELECT COALESCE(SUM(sold_price), 0) AS total
      FROM customer_services
      WHERE sold_date >= date_trunc('month', CURRENT_DATE)
    `),
  ]);

  const statusMap: Record<string, number> = {};
  for (const row of statusCounts.rows) {
    statusMap[row.status] = parseInt(row.count, 10);
  }

  return {
    leads_by_status: statusMap,
    total_leads: conversionRate.rows[0].total,
    won_leads: conversionRate.rows[0].won,
    conversion_rate: parseFloat(conversionRate.rows[0].rate || '0'),
    total_revenue: parseFloat(totalRevenue.rows[0].total),
    monthly_revenue: parseFloat(monthlyRevenue.rows[0].total),
  };
}

export async function getCommissions(filters: {
  employee_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.employee_id) {
    conditions.push(`cs.sold_by = $${paramIndex}`);
    params.push(filters.employee_id);
    paramIndex++;
  }
  if (filters.date_from) {
    conditions.push(`cs.sold_date >= $${paramIndex}`);
    params.push(filters.date_from);
    paramIndex++;
  }
  if (filters.date_to) {
    conditions.push(`cs.sold_date <= $${paramIndex}`);
    params.push(filters.date_to);
    paramIndex++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const details = await db.query(
    `SELECT cs.id, cs.sold_price, cs.sold_date, cs.price_model, cs.contract_months,
            s.name as service_name, s.commission_rate,
            CASE
              WHEN cs.price_model = 'monatlich' AND cs.contract_months IS NOT NULL
              THEN ROUND(cs.sold_price * cs.contract_months * s.commission_rate / 100, 2)
              ELSE ROUND(cs.sold_price * s.commission_rate / 100, 2)
            END as commission_amount,
            c.company_name as customer_name,
            u.name as employee_name, u.id as employee_id
     FROM customer_services cs
     JOIN services s ON cs.service_id = s.id
     JOIN customers c ON cs.customer_id = c.id
     LEFT JOIN users u ON cs.sold_by = u.id
     ${where}
     ORDER BY cs.sold_date DESC`,
    params
  );

  const summaryResult = await db.query(
    `SELECT u.id as employee_id, u.name as employee_name,
            COUNT(cs.id)::int as total_sales,
            COALESCE(SUM(cs.sold_price), 0)::numeric as total_revenue,
            COALESCE(SUM(
              CASE
                WHEN cs.price_model = 'monatlich' AND cs.contract_months IS NOT NULL
                THEN ROUND(cs.sold_price * cs.contract_months * s.commission_rate / 100, 2)
                ELSE ROUND(cs.sold_price * s.commission_rate / 100, 2)
              END
            ), 0)::numeric as total_commission
     FROM users u
     LEFT JOIN customer_services cs ON cs.sold_by = u.id
     LEFT JOIN services s ON cs.service_id = s.id
     WHERE u.is_active = true
     GROUP BY u.id, u.name
     ORDER BY total_commission DESC`
  );

  return {
    details: details.rows,
    summary: summaryResult.rows,
  };
}

export async function getRecentActivity() {
  const result = await db.query(
    `SELECT la.*, u.name as user_name, l.company_name
     FROM lead_activities la
     JOIN users u ON la.user_id = u.id
     JOIN leads l ON la.lead_id = l.id
     ORDER BY la.created_at DESC
     LIMIT 20`
  );
  return result.rows;
}
