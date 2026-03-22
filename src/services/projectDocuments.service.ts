import { db } from '../config/database.js';

export async function getByProject(projectId: string) {
  const result = await db.query(
    `SELECT pd.*, u.name as created_by_name
     FROM project_documents pd
     LEFT JOIN users u ON pd.created_by = u.id
     WHERE pd.project_id = $1
     ORDER BY pd.type ASC, pd.created_at DESC`,
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

  // Count existing versions of this type
  const versionResult = await db.query(
    'SELECT COALESCE(MAX(version), 0) + 1 as next_version FROM project_documents WHERE project_id = $1 AND type = $2',
    [projectId, type]
  );
  const nextVersion = versionResult.rows[0].next_version;

  const result = await db.query(
    `INSERT INTO project_documents (project_id, type, title, generated_html, template_data, version, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [projectId, type, title, htmlContent, JSON.stringify(templateData), nextVersion, userId]
  );

  return result.rows[0];
}

export async function remove(docId: string) {
  const result = await db.query('DELETE FROM project_documents WHERE id = $1', [docId]);
  return (result.rowCount || 0) > 0;
}

// ─── HTML Template Builder ──────────────────────────────────

function buildHtml(type: string, project: Record<string, unknown>, modules: Record<string, unknown>[]): string {
  const clientName = (project.customer_name || project.prospect_name || 'Interessent') as string;
  const today = new Date().toLocaleDateString('de-DE');
  const phases = [...new Set(modules.map(m => m.phase || 0))].sort() as number[];

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

function fmt(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function buildBriefingHtml(project: Record<string, unknown>, modules: Record<string, unknown>[], clientName: string, today: string, phases: number[]): string {
  const totalSetup = modules.reduce((s, m) => s + (Number(m.setup_price_customer) || 0), 0);
  const totalMonthly = modules.reduce((s, m) => s + (Number(m.monthly_price_customer) || 0), 0);
  const totalHours = modules.reduce((s, m) => s + (Number(m.estimated_hours) || 0), 0);

  const moduleRows = modules.map(m => `
    <tr>
      <td>${m.name}</td><td>${m.category}</td><td>Phase ${m.phase || '-'}</td>
      <td>${m.estimated_hours || '-'} h</td><td>${m.complexity || '-'}</td>
      <td>${fmt(Number(m.setup_price_customer) || 0)}</td>
      <td>${fmt(Number(m.monthly_price_customer) || 0)}</td>
    </tr>`).join('');

  const phaseOverview = phases.map(phase => {
    const pm = modules.filter(m => (m.phase || 0) === phase);
    return `<li><strong>Phase ${phase}:</strong> ${pm.map(m => m.name).join(', ')}</li>`;
  }).join('');

  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Briefing: ${project.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#1a1a2e}h2{color:#16213e;border-bottom:2px solid #e2e8f0;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f7fafc;font-weight:600}.total{font-weight:bold;background:#f0fff4}.meta{color:#666;font-size:14px}</style>
</head><body>
<h1>Meeting Briefing</h1><p class="meta">Erstellt am ${today}</p>
<h2>Projektübersicht</h2>
<table>
  <tr><th>Projekt</th><td>${project.title}</td></tr>
  <tr><th>Kunde</th><td>${clientName}</td></tr>
  <tr><th>Status</th><td>${project.status}</td></tr>
  <tr><th>Betreuer</th><td>${project.assigned_to_name || '-'}</td></tr>
</table>
${project.description ? `<h2>Beschreibung</h2><p>${project.description}</p>` : ''}
<h2>Module (${modules.length})</h2>
<table>
  <thead><tr><th>Name</th><th>Kategorie</th><th>Phase</th><th>Stunden</th><th>Komplexität</th><th>Setup</th><th>Monatlich</th></tr></thead>
  <tbody>${moduleRows}</tbody>
  <tfoot><tr class="total"><td colspan="3">Gesamt</td><td>${totalHours} h</td><td></td><td>${fmt(totalSetup)}</td><td>${fmt(totalMonthly)}</td></tr></tfoot>
</table>
<h2>Phasen</h2><ul>${phaseOverview}</ul>
<h2>Finanzen</h2>
<table>
  <tr><th>Setup (einmalig)</th><td>${fmt(totalSetup)}</td></tr>
  <tr><th>Monatlich</th><td>${fmt(totalMonthly)}</td></tr>
  <tr class="total"><th>Jahreswert</th><td>${fmt(totalSetup + totalMonthly * 12)}</td></tr>
</table>
</body></html>`;
}

function buildAngebotHtml(project: Record<string, unknown>, modules: Record<string, unknown>[], clientName: string, today: string, phases: number[]): string {
  const totalSetup = modules.reduce((s, m) => s + (Number(m.setup_price_customer) || 0), 0);
  const totalMonthly = modules.reduce((s, m) => s + (Number(m.monthly_price_customer) || 0), 0);

  const moduleRows = modules.map(m => `
    <tr>
      <td>${m.name}</td><td>${m.description || '-'}</td>
      <td>${fmt(Number(m.setup_price_customer) || 0)}</td>
      <td>${fmt(Number(m.monthly_price_customer) || 0)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Angebot: ${project.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#1a1a2e}h2{color:#16213e;border-bottom:2px solid #e2e8f0;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f7fafc;font-weight:600}.total{font-weight:bold;background:#f0fff4}.meta{color:#666;font-size:14px}</style>
</head><body>
<h1>Angebot</h1><p class="meta">${today}</p>
<h2>Für: ${clientName}</h2>
${project.prospect_contact ? `<p>z.Hd. ${project.prospect_contact}</p>` : ''}
<h2>Projekt: ${project.title}</h2>
${project.description ? `<p>${project.description}</p>` : ''}
<h2>Leistungsübersicht</h2>
<table>
  <thead><tr><th>Leistung</th><th>Beschreibung</th><th>Setup (netto)</th><th>Monatlich (netto)</th></tr></thead>
  <tbody>${moduleRows}</tbody>
  <tfoot>
    <tr class="total"><td colspan="2"><strong>Gesamt (netto)</strong></td><td><strong>${fmt(totalSetup)}</strong></td><td><strong>${fmt(totalMonthly)}</strong></td></tr>
    <tr><td colspan="2">zzgl. 19% MwSt.</td><td>${fmt(totalSetup * 0.19)}</td><td>${fmt(totalMonthly * 0.19)}</td></tr>
    <tr class="total"><td colspan="2"><strong>Gesamt (brutto)</strong></td><td><strong>${fmt(totalSetup * 1.19)}</strong></td><td><strong>${fmt(totalMonthly * 1.19)}</strong></td></tr>
  </tfoot>
</table>
<p style="margin-top:40px;font-size:13px;color:#666">Dieses Angebot ist 30 Tage gültig. Alle Preise in Euro.</p>
<p style="font-size:13px;color:#666">Brady Digital GmbH · Hinter der Bahn 9 · 21435 Stelle · HRB 210921 AG Lüneburg</p>
</body></html>`;
}

function buildKalkulationHtml(project: Record<string, unknown>, modules: Record<string, unknown>[], clientName: string, today: string, phases: number[]): string {
  const totalSetupIntern = modules.reduce((s, m) => s + (Number(m.setup_cost_internal) || 0), 0);
  const totalSetupKunde = modules.reduce((s, m) => s + (Number(m.setup_price_customer) || 0), 0);
  const totalMonthlyIntern = modules.reduce((s, m) => s + (Number(m.monthly_cost_internal) || 0), 0);
  const totalMonthlyKunde = modules.reduce((s, m) => s + (Number(m.monthly_price_customer) || 0), 0);
  const setupMarge = totalSetupKunde - totalSetupIntern;
  const monthlyMarge = totalMonthlyKunde - totalMonthlyIntern;

  const moduleRows = modules.map(m => {
    const si = Number(m.setup_cost_internal) || 0;
    const sk = Number(m.setup_price_customer) || 0;
    const mi = Number(m.monthly_cost_internal) || 0;
    const mk = Number(m.monthly_price_customer) || 0;
    const marge = (sk + mk) > 0 ? (((sk - si + mk - mi) / (sk + mk)) * 100).toFixed(0) : '0';
    return `<tr><td>${m.name}</td><td>${fmt(si)}</td><td>${fmt(sk)}</td><td>${fmt(mi)}</td><td>${fmt(mk)}</td><td>${marge}%</td></tr>`;
  }).join('');

  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Kalkulation: ${project.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#c0392b}h2{color:#16213e;border-bottom:2px solid #e2e8f0;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f7fafc;font-weight:600}.total{font-weight:bold;background:#f0fff4}.warn{background:#fff5f5;color:#c0392b;padding:8px;border-radius:4px;font-size:13px}</style>
</head><body>
<p class="warn">⚠ INTERN – NICHT AN KUNDEN WEITERGEBEN</p>
<h1>Kalkulation</h1><p style="color:#666">${today} · ${clientName}</p>
<h2>Projekt: ${project.title}</h2>
<h2>Modulkalkulation</h2>
<table>
  <thead><tr><th>Modul</th><th>Setup intern</th><th>Setup Kunde</th><th>Monatl. intern</th><th>Monatl. Kunde</th><th>Marge</th></tr></thead>
  <tbody>${moduleRows}</tbody>
  <tfoot><tr class="total"><td>Gesamt</td><td>${fmt(totalSetupIntern)}</td><td>${fmt(totalSetupKunde)}</td><td>${fmt(totalMonthlyIntern)}</td><td>${fmt(totalMonthlyKunde)}</td><td>${totalSetupKunde + totalMonthlyKunde > 0 ? (((setupMarge + monthlyMarge) / (totalSetupKunde + totalMonthlyKunde)) * 100).toFixed(0) : 0}%</td></tr></tfoot>
</table>
<h2>Zusammenfassung</h2>
<table>
  <tr><th>Setup-Marge</th><td>${fmt(setupMarge)} (${totalSetupKunde > 0 ? ((setupMarge / totalSetupKunde) * 100).toFixed(0) : 0}%)</td></tr>
  <tr><th>Monatliche Marge</th><td>${fmt(monthlyMarge)} (${totalMonthlyKunde > 0 ? ((monthlyMarge / totalMonthlyKunde) * 100).toFixed(0) : 0}%)</td></tr>
  <tr class="total"><th>Jahres-Marge</th><td>${fmt(setupMarge + monthlyMarge * 12)}</td></tr>
</table>
</body></html>`;
}

function buildDefaultHtml(project: Record<string, unknown>, modules: Record<string, unknown>[], clientName: string, today: string): string {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>${project.title}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}h1{color:#1a1a2e}h2{color:#16213e;border-bottom:2px solid #e2e8f0;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}th{background:#f7fafc}</style>
</head><body>
<h1>${project.title}</h1><p>${today} · ${clientName}</p>
${project.description ? `<p>${project.description}</p>` : ''}
<h2>Module (${modules.length})</h2>
<ul>${modules.map(m => `<li><strong>${m.name}</strong> (${m.category})${m.description ? ': ' + m.description : ''}</li>`).join('')}</ul>
</body></html>`;
}
