// ============================================================
//  AGS CONCEPT — API BACKEND VERCEL SERVERLESS
//  /api/contact.js — VERSION CORRIGÉE
//
//  PDF généré manuellement (pas de dépendance jsPDF)
//  Compatible 100% Vercel serverless
// ============================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Methode non autorisee' });
  }

  try {
    const data = req.body;

    const errors = validatePayload(data);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }

    const refNum = generateRef();
    const pdfBase64 = generatePDF(data, refNum);

    await sendInternalEmail(data, refNum, pdfBase64);
    await sendClientEmail(data, refNum);
    await addToCRM(data, refNum);

    return res.status(200).json({
      success: true,
      message: 'Votre demande a bien ete envoyee.',
      reference: refNum,
    });

  } catch (error) {
    console.error('Erreur workflow AGS:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors du traitement. Veuillez reessayer.',
    });
  }
}

// ─── VALIDATION ───

function validatePayload(data) {
  const errors = [];
  if (!data.fullName?.trim()) errors.push('Nom complet requis');
  if (!data.company?.trim()) errors.push('Societe requise');
  if (!data.email?.trim() || !/\S+@\S+\.\S+/.test(data.email)) errors.push('Email invalide');
  if (!data.phone?.trim()) errors.push('Telephone requis');
  if (!data.postalCode?.trim()) errors.push('Code postal requis');
  if (!data.country?.trim()) errors.push('Pays requis');
  if (!data.projectType?.length) errors.push('Type de projet requis');
  if (!data.budget?.length) errors.push('Budget requis');
  if (!data.deadline?.length) errors.push('Delai requis');
  return errors;
}

// ─── RÉFÉRENCE UNIQUE ───

function generateRef() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `AGS-${y}${m}${day}-${r}`;
}

// ─── GÉNÉRATION PDF (pur PDF 1.4, aucune dépendance) ───

function generatePDF(data, refNum) {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const projectTypes = Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType;
  const budgetStr = Array.isArray(data.budget) ? data.budget.join(', ') : data.budget;
  const deadlineStr = Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline;
  const assetsStr = Array.isArray(data.existingAssets) && data.existingAssets.length > 0
    ? data.existingAssets.join(', ') : 'Aucun';

  const esc = (str) => String(str || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, ' ');

  const ops = [];
  let y = 770;

  const text = (str, x, size, bold = false) => {
    ops.push(`BT ${bold ? '/F2' : '/F1'} ${size} Tf ${x} ${y} Td (${esc(str)}) Tj ET`);
  };

  const line = (gap = 16) => { y -= gap; };

  // Header
  ops.push('0.059 0.090 0.165 rg'); // Navy
  text('AGS Concept', 50, 24, true);
  ops.push('0 0 0 rg');
  line(5);
  ops.push('0.4 0.4 0.4 rg');
  text('Ref: ' + refNum, 420, 9);
  line(12);
  text(date, 420, 9);
  ops.push('0 0 0 rg');
  line(12);

  // Separator
  ops.push('0.059 0.090 0.165 rg');
  ops.push(`50 ${y} 500 1 re f`);
  line(30);

  // Title bar
  ops.push(`45 ${y - 2} 510 22 re f`);
  ops.push('1 1 1 rg');
  text('FICHE DE DEMANDE CLIENT', 56, 12, true);
  ops.push('0 0 0 rg');
  line(40);

  // Client section
  ops.push('0.878 0.404 0.196 rg'); // Orange
  text('INFORMATIONS CLIENT', 50, 11, true);
  ops.push('0 0 0 rg');
  line(24);

  const clientInfo = [
    ['Nom complet', data.fullName],
    ['Societe', data.company],
    ['Email', data.email],
    ['Telephone', data.phone],
    ['Code postal', data.postalCode],
    ['Pays', data.country],
  ];

  clientInfo.forEach(([label, val]) => {
    ops.push('0.5 0.5 0.5 rg');
    text(label, 50, 10);
    ops.push('0.12 0.16 0.22 rg');
    text(esc(val), 180, 10, true);
    ops.push('0 0 0 rg');
    line(18);
  });

  line(8);
  ops.push('0.92 0.92 0.92 rg');
  ops.push(`50 ${y} 500 0.5 re f`);
  ops.push('0 0 0 rg');
  line(24);

  // Project section
  ops.push('0.878 0.404 0.196 rg');
  text('DETAILS DU PROJET', 50, 11, true);
  ops.push('0 0 0 rg');
  line(24);

  const projectInfo = [
    ['Type de projet', projectTypes],
    ['Budget', budgetStr],
    ['Delai', deadlineStr],
    ['Elements existants', assetsStr],
  ];

  projectInfo.forEach(([label, val]) => {
    ops.push('0.5 0.5 0.5 rg');
    text(label, 50, 10);
    ops.push('0.12 0.16 0.22 rg');
    const truncated = String(val || '').substring(0, 65);
    text(esc(truncated), 200, 10, true);
    ops.push('0 0 0 rg');
    line(18);
  });

  // Description
  if (data.description?.trim()) {
    line(12);
    ops.push('0.878 0.404 0.196 rg');
    text('DESCRIPTION', 50, 11, true);
    ops.push('0 0 0 rg');
    line(22);

    ops.push('0.97 0.98 0.99 rg');
    ops.push(`50 ${y - 5} 500 ${Math.min(80, 20 + Math.ceil(data.description.length / 75) * 14)} re f`);
    ops.push('0.2 0.2 0.2 rg');

    const desc = String(data.description).substring(0, 400);
    for (let i = 0; i < desc.length; i += 75) {
      text(esc(desc.substring(i, i + 75)), 58, 9);
      line(14);
    }
    ops.push('0 0 0 rg');
  }

  // Footer
  y = 35;
  ops.push('0.6 0.6 0.6 rg');
  text('Document genere automatiquement - AGS Concept ' + new Date().getFullYear(), 50, 7);
  ops.push('0.878 0.404 0.196 rg');
  text('agsconcept@outlook.com', 420, 7, true);

  // Assemble PDF
  const stream = ops.join('\n');
  const streamBytes = Buffer.byteLength(stream, 'binary');

  // Build PDF with correct xref offsets
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n';
  const obj4 = `4 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n';
  const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n';

  const header = '%PDF-1.4\n';
  const body = obj1 + obj2 + obj3 + obj4 + obj5 + obj6;

  const offsets = [];
  let pos = header.length;
  [obj1, obj2, obj3, obj4, obj5, obj6].forEach(obj => {
    offsets.push(pos);
    pos += obj.length;
  });

  const xrefStart = pos;
  const xref = `xref\n0 7\n0000000000 65535 f \n${offsets.map(o => String(o).padStart(10, '0') + ' 00000 n ').join('\n')}\n`;
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const fullPdf = header + body + xref + trailer;

  return Buffer.from(fullPdf, 'binary').toString('base64');
}

// ─── EMAIL INTERNE ───

async function sendInternalEmail(data, refNum, pdfBase64) {
  const projectTypes = Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType;
  const budgetStr = Array.isArray(data.budget) ? data.budget.join(', ') : data.budget;
  const deadlineStr = Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline;
  const assetsStr = Array.isArray(data.existingAssets) && data.existingAssets.length > 0 ? data.existingAssets.join(', ') : 'Aucun';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: process.env.AGS_SENDER_NAME || 'AGS Concept', email: process.env.AGS_SENDER_EMAIL },
      to: [{ email: process.env.AGS_INTERNAL_EMAIL }],
      subject: `Nouveau lead - ${data.fullName} (${data.company}) - ${refNum}`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto">
          <div style="background:#0F172A;padding:24px 28px;border-radius:8px 8px 0 0">
            <h1 style="color:#E06732;margin:0;font-size:20px">Nouvelle demande client</h1>
            <p style="color:#94a3b8;margin:6px 0 0;font-size:13px">Ref: ${refNum}</p>
          </div>
          <div style="padding:28px;border:1px solid #e5e7eb;border-top:none">
            <h3 style="color:#E06732;font-size:13px;text-transform:uppercase;margin:0 0 14px">Client</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px">Nom</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.fullName}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Societe</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.company}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0;font-size:13px"><a href="mailto:${data.email}" style="color:#E06732">${data.email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Telephone</td><td style="padding:6px 0;font-size:13px"><a href="tel:${data.phone}" style="color:#E06732">${data.phone}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Localisation</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.postalCode} - ${data.country}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
            <h3 style="color:#E06732;font-size:13px;text-transform:uppercase;margin:0 0 14px">Projet</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Type</td><td style="padding:6px 0;font-size:13px;font-weight:600">${projectTypes}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Budget</td><td style="padding:6px 0;font-size:13px;font-weight:600">${budgetStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Delai</td><td style="padding:6px 0;font-size:13px;font-weight:600">${deadlineStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Elements existants</td><td style="padding:6px 0;font-size:13px;font-weight:600">${assetsStr}</td></tr>
            </table>
            ${data.description ? `<div style="background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e5e7eb"><p style="margin:0 0 6px;font-size:11px;color:#E06732;font-weight:700;text-transform:uppercase">Description</p><p style="margin:0;font-size:13px;color:#374151;line-height:1.6">${data.description}</p></div>` : ''}
          </div>
          <div style="background:#f9fafb;padding:14px 28px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;border-top:none">
            <p style="margin:0;font-size:11px;color:#9ca3af">PDF en piece jointe</p>
          </div>
        </div>`,
      attachment: [{ content: pdfBase64, name: `AGS_Demande_${refNum}.pdf` }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erreur email interne:', err);
    throw new Error(`Email interne echoue: ${response.status}`);
  }
}

// ─── EMAIL CLIENT ───

async function sendClientEmail(data, refNum) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: process.env.AGS_SENDER_NAME || 'AGS Concept', email: process.env.AGS_SENDER_EMAIL },
      to: [{ email: data.email, name: data.fullName }],
      subject: `Votre demande ${refNum} - AGS Concept`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0F172A;padding:32px;text-align:center;border-radius:8px 8px 0 0">
            <h1 style="color:#E06732;margin:0;font-size:24px">AGS Concept</h1>
            <p style="color:#94a3b8;margin:8px 0 0;font-size:13px">Votre demande a bien ete recue</p>
          </div>
          <div style="padding:32px;border:1px solid #e5e7eb;border-top:none">
            <p style="font-size:16px;color:#0F172A;margin:0 0 16px">Bonjour <strong>${data.fullName}</strong>,</p>
            <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px">
              Nous avons bien recu votre demande concernant <strong style="color:#E06732">${Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType}</strong>.
              Notre equipe analyse votre projet et reviendra vers vous dans les <strong>24 a 48 heures</strong>.
            </p>
            <div style="background:#FDF0EA;border-radius:8px;padding:18px 24px;border-left:4px solid #E06732">
              <p style="margin:0;font-size:12px;color:#9ca3af">Votre reference</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#0F172A;font-family:monospace">${refNum}</p>
            </div>
            <p style="font-size:13px;color:#6b7280;margin:24px 0 0;line-height:1.6">
              Conservez cette reference pour tout echange futur.
              Contactez-nous au <a href="tel:+33782928620" style="color:#E06732;font-weight:600">+33 7 82 92 86 20</a>.
            </p>
          </div>
          <div style="background:#0F172A;padding:20px 32px;text-align:center;border-radius:0 0 8px 8px">
            <p style="color:#64748b;font-size:11px;margin:0">AGS Concept - Solutions digitales sur mesure</p>
            <p style="color:#E06732;font-size:11px;margin:4px 0 0;font-weight:600">agsconcept@outlook.com</p>
          </div>
        </div>`,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erreur email client:', err);
    throw new Error(`Email client echoue: ${response.status}`);
  }
}

// ─── CRM BREVO ───

async function addToCRM(data, refNum) {
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        attributes: {
          FIRSTNAME: data.fullName.split(' ').slice(0, -1).join(' ') || data.fullName,
          LASTNAME: data.fullName.split(' ').slice(-1)[0] || '',
          SMS: data.phone,
          COMPANY: data.company,
          POSTAL_CODE: data.postalCode,
          COUNTRY: data.country,
          PROJECT_TYPE: Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType,
          BUDGET: Array.isArray(data.budget) ? data.budget.join(', ') : data.budget,
          DEADLINE: Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline,
          EXISTING_ASSETS: Array.isArray(data.existingAssets) ? data.existingAssets.join(', ') : '',
          REFERENCE: refNum,
          DESCRIPTION: data.description || '',
        },
        listIds: [2],
        updateEnabled: true,
      }),
    });
  } catch (err) {
    console.warn('CRM non critique:', err.message);
  }
}