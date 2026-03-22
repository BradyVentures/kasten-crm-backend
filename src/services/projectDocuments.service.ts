import { db } from '../config/database.js';

export async function getByProject(projectId: string) {
  const result = await db.query(
    `SELECT * FROM project_documents
     WHERE project_id = $1
     ORDER BY type ASC, created_at DESC`,
    [projectId]
  );
  return result.rows;
}

export async function generate(
  projectId: string,
  type: string,
  title: string,
  userId: string
) {
  // Load project with modules
  const projectResult = await db.query(
    `SELECT p.*,
            c.company_name as customer_name,
            c.contact_person as customer_contact,
            c.email as customer_email,
            u.name as assigned_to_name
     FROM projects p
     LEFT JOIN customers c ON p.customer_id = c.id
     LEFT JOIN users u ON p.assigned_to = u.id
     WHERE p.id = $1`,
    [projectId]
  );

  if (projectResult.rows.length === 0) {
    throw new Error('Projekt nicht gefunden');
  }

  const project = projectResult.rows[0];

  const modulesResult = await db.query(
    `SELECT * FROM project_modules WHERE project_id = $1 ORDER BY phase ASC NULLS LAST, sort_order ASC`,
    [projectId]
  );

  const modules = modulesResult.rows;

  const templateData = {
    project,
    modules,
    generated_at: new Date().toISOString(),
    generated_by: userId,
  };

  const htmlContent = buildHtml(type, project, modules);

  const result = await db.query(
    `INSERT INTO project_documents (project_id, type, title, content, template_data, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [projectId, type, title, htmlContent, JSON.stringify(templateData), userId]
  );

  return result.rows[0];
}

export async function remove(docId: string) {
  const result = await db.query('DELETE FROM project_documents WHERE id = $1', [docId]);
  return (result.rowCount || 0) > 0;
}

function buildHtml(type: string, project: Record<string, unknown>, modules: Record<string, unknown>[]): string {
  const clientName = (project.customer_name || project.prospect_name || 'Unbekannt') as string;
  const today = new Date().toLocaleDateString('de-DE');

  const phases = [...new Set(modules.map(m => (m.phase as string) || 'Ungeplant'))];

  switch (type) {
    case 'briefing':
      return buildBriefingHtml(project, modules, clientName, today, phases);
    case 'angebot':
      return buildAngebotHtml(project, modules, clientName, today, phases);
    case 'kalkulation':
      return buildKalkulationHtml(project, modules, clientName, today, phases);
    default:
      return buildDefaultHtml(project, modules, clientName, today);
  }
}

function buildBriefingHtml(
  project: Record<string, unknown>,
  modules: Record<string, unknown>[],
  clientName: string,
  today: string,
  phases: string[]
): string {
  const totalPrice = modules.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
  const totalHours = modules.reduce((sum, m) => sum + (Number(m.estimated_hours) || 0), 0);

  const moduleRows = modules.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.category}</td>
      <td>${m.phase || '-'}</td>
      <td>${m.estimated_hours || '-'} h</td>
      <td>${m.complexity || '-'}</td>
      <td>${formatCurrency(Number(m.price) || 0)}</td>
    </tr>
  `).join('');

  const phaseOverview = phases.map(phase => {
    const phaseModules = modules.filter(m => (m.phase || 'Ungeplant') === phase);
    const phasePrice = phaseModules.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
    return `<li><strong>${phase}:</strong> ${phaseModules.length} Module, ${formatCurrency(phasePrice)}</li>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Briefing: ${project.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#1a1a2e}h2{color:#16213e;border-bottom:2px solid #e2e8f0;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f7fafc;font-weight:600}.meta{color:#666;font-size:14px}.total{font-weight:bold;background:#f0fff4}</style>
</head>
<body>
<h1>Meeting Briefing</h1>
<p class="meta">Erstellt am ${today}</p>

<h2>Projektübersicht</h2>
<table>
  <tr><th>Projekt</th><td>${project.title}</td></tr>
  <tr><th>Kunde</th><td>${clientName}</td></tr>
  <tr><th>Status</th><td>${project.status}</td></tr>
  <tr><th>Betreuer</th><td>${project.assigned_to_name || '-'}</td></tr>
  <tr><th>Zeitraum</th><td>${project.estimated_start || '?'} – ${project.estimated_end || '?'}</td></tr>
</table>

${project.description ? `<h2>Beschreibung</h2><p>${project.description}</p>` : ''}

<h2>Module (${modules.length})</h2>
<table>
  <thead><tr><th>Name</th><th>Kategorie</th><th>Phase</th><th>Stunden</th><th>Komplexität</th><th>Preis</th></tr></thead>
  <tbody>${moduleRows}</tbody>
  <tfoot><tr class="total"><td colspan="3">Gesamt</td><td>${totalHours} h</td><td></td><td>${formatCurrency(totalPrice)}</td></tr></tfoot>
</table>

<h2>Phasen-Übersicht</h2>
<ul>${phaseOverview}</ul>

<h2>Finanzen</h2>
<table>
  <tr><th>Gesamtpreis</th><td>${formatCurrency(totalPrice)}</td></tr>
  <tr><th>Interne Kosten</th><td>${formatCurrency(Number(project.total_internal_cost) || 0)}</td></tr>
  <tr><th>Externe Kosten</th><td>${formatCurrency(Number(project.total_external_cost) || 0)}</td></tr>
  <tr class="total"><th>Marge</th><td>${formatCurrency(totalPrice - (Number(project.total_internal_cost) || 0) - (Number(project.total_external_cost) || 0))}</td></tr>
</table>
</body></html>`;
}

function buildAngebotHtml(
  project: Record<string, unknown>,
  modules: Record<string, unknown>[],
  clientName: string,
  today: string,
  phases: string[]
): string {
  const totalPrice = modules.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
  const totalNet = totalPrice;
  const vat = totalNet * 0.19;
  const totalGross = totalNet + vat;

  const moduleRows = modules.map(m => `
    <tr>
      <td>${m.name}</td>
      <td>${m.description || '-'}</td>
      <td>${m.estimated_weeks ? `${m.estimated_weeks} Wochen` : '-'}</td>
      <td>${formatCurrency(Number(m.price) || 0)}</td>
    </tr>
  `).join('');

  const phaseBlocks = phases.map(phase => {
    const phaseModules = modules.filter(m => (m.phase || 'Ungeplant') === phase);
    const items = phaseModules.map(m => `<li><strong>${m.name}</strong>${m.description ? ': ' + m.description : ''}</li>`).join('');
    return `<h3>${phase}</h3><ul>${items}</ul>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Angebot: ${project.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#1a1a2e}h2{color:#16213e;border-bottom:2px solid #e2e8f0;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f7fafc;font-weight:600}.meta{color:#666;font-size:14px}.total{font-weight:bold;background:#f0fff4}.header{text-align:center;margin-bottom:40px}</style>
</head>
<body>
<div class="header">
  <h1>Angebot</h1>
  <p class="meta">${today}</p>
</div>

<h2>Für: ${clientName}</h2>
${project.prospect_contact ? `<p>z.Hd. ${project.prospect_contact}</p>` : ''}

<h2>Projekt: ${project.title}</h2>
${project.description ? `<p>${project.description}</p>` : ''}

<h2>Leistungsübersicht</h2>
<table>
  <thead><tr><th>Leistung</th><th>Beschreibung</th><th>Zeitraum</th><th>Preis (netto)</th></tr></thead>
  <tbody>${moduleRows}</tbody>
  <tfoot>
    <tr><td colspan="3" style="text-align:right"><strong>Netto</strong></td><td>${formatCurrency(totalNet)}</td></tr>
    <tr><td colspan="3" style="text-align:right">zzgl. 19% MwSt.</td><td>${formatCurrency(vat)}</td></tr>
    <tr class="total"><td colspan="3" style="text-align:right"><strong>Gesamt (brutto)</strong></td><td><strong>${formatCurrency(totalGross)}</strong></td></tr>
  </tfoot>
</table>

<h2>Projektphasen</h2>
${phaseBlocks}

<p style="margin-top:40px;font-size:13px;color:#666">Dieses Angebot ist 30 Tage gültig. Alle Preise in Euro netto zzgl. gesetzl. MwSt.</p>
</body></html>`;
}

function buildKalkulationHtml(
  project: Record<string, unknown>,
  modules: Record<string, unknown>[],
  clientName: string,
  today: string,
  phases: string[]
): string {
  const totalPrice = modules.reduce((sum, m) => sum + (Number(m.price) || 0), 0);
  const totalInternal = modules.reduce((sum, m) => sum + (Number(m.internal_cost) || 0), 0);
  const totalExternal = modules.reduce((sum, m) => sum + (Number(m.external_cost) || 0), 0);
  const totalCost = totalInternal + totalExternal;
  const margin = totalPrice - totalCost;
  const marginPercent = totalPrice > 0 ? ((margin / totalPrice) * 100).toFixed(1) : '0';

  const moduleRows = modules.map(m => {
    const price = Number(m.price) || 0;
    const intCost = Number(m.internal_cost) || 0;
    const extCost = Number(m.external_cost) || 0;
    const modMargin = price - intCost - extCost;
    return `
    <tr>
      <td>${m.name}</td>
      <td>${m.category}</td>
      <td>${formatCurrency(intCost)}</td>
      <td>${formatCurrency(extCost)}</td>
      <td>${formatCurrency(price)}</td>
      <td>${formatCurrency(modMargin)}</td>
      <td>${price > 0 ? ((modMargin / price) * 100).toFixed(1) : '0'}%</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Kalkulation: ${project.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#c0392b}h2{color:#16213e;border-bottom:2px solid #e2e8f0;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f7fafc;font-weight:600}.meta{color:#666;font-size:14px}.total{font-weight:bold;background:#f0fff4}.warn{color:#c0392b;font-weight:bold}.internal{background:#fff5f5;color:#c0392b;padding:4px 8px;font-size:12px;border-radius:4px}</style>
</head>
<body>
<p class="internal">⚠ INTERN – NICHT AN KUNDEN WEITERGEBEN</p>
<h1>Kalkulation</h1>
<p class="meta">Erstellt am ${today}</p>

<h2>Projekt: ${project.title}</h2>
<p>Kunde: ${clientName}</p>

<h2>Modulkalkulation</h2>
<table>
  <thead><tr><th>Modul</th><th>Kategorie</th><th>Interne Kosten</th><th>Externe Kosten</th><th>Preis</th><th>Marge</th><th>Marge %</th></tr></thead>
  <tbody>${moduleRows}</tbody>
  <tfoot>
    <tr class="total">
      <td colspan="2">Gesamt</td>
      <td>${formatCurrency(totalInternal)}</td>
      <td>${formatCurrency(totalExternal)}</td>
      <td>${formatCurrency(totalPrice)}</td>
      <td>${formatCurrency(margin)}</td>
      <td>${marginPercent}%</td>
    </tr>
  </tfoot>
</table>

<h2>Zusammenfassung</h2>
<table>
  <tr><th>Gesamtpreis (netto)</th><td>${formatCurrency(totalPrice)}</td></tr>
  <tr><th>Interne Kosten</th><td>${formatCurrency(totalInternal)}</td></tr>
  <tr><th>Externe Kosten</th><td>${formatCurrency(totalExternal)}</td></tr>
  <tr><th>Gesamtkosten</th><td>${formatCurrency(totalCost)}</td></tr>
  <tr class="total"><th>Marge</th><td>${formatCurrency(margin)} (${marginPercent}%)</td></tr>
  <tr><th>Break-Even bei Stunden</th><td>${totalPrice > 0 && totalInternal > 0 ? Math.ceil(totalCost / ((totalPrice / modules.reduce((s, m) => s + (Number(m.estimated_hours) || 0), 0)) || 1)) : '-'} h</td></tr>
</table>

${phases.length > 0 ? `<h2>Phasen-Kosten</h2><ul>${phases.map(phase => {
    const pm = modules.filter(m => (m.phase || 'Ungeplant') === phase);
    const pCost = pm.reduce((s, m) => s + (Number(m.internal_cost) || 0) + (Number(m.external_cost) || 0), 0);
    const pPrice = pm.reduce((s, m) => s + (Number(m.price) || 0), 0);
    return `<li><strong>${phase}:</strong> Kosten ${formatCurrency(pCost)}, Preis ${formatCurrency(pPrice)}, Marge ${formatCurrency(pPrice - pCost)}</li>`;
  }).join('')}</ul>` : ''}
</body></html>`;
}

function buildDefaultHtml(
  project: Record<string, unknown>,
  modules: Record<string, unknown>[],
  clientName: string,
  today: string
): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>${project.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#1a1a2e}h2{color:#16213e;border-bottom:2px solid #e2e8f0;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f7fafc}</style>
</head>
<body>
<h1>${project.title}</h1>
<p>Erstellt am ${today}</p>

<h2>Projektinformationen</h2>
<table>
  <tr><th>Kunde</th><td>${clientName}</td></tr>
  <tr><th>Status</th><td>${project.status}</td></tr>
  <tr><th>Betreuer</th><td>${project.assigned_to_name || '-'}</td></tr>
</table>

${project.description ? `<h2>Beschreibung</h2><p>${project.description}</p>` : ''}

<h2>Module (${modules.length})</h2>
<ul>${modules.map(m => `<li><strong>${m.name}</strong> (${m.category})${m.description ? ': ' + m.description : ''}</li>`).join('')}</ul>
</body></html>`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}
