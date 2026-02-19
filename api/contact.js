// ============================================================
//  AGS CONCEPT — API BACKEND VERCEL SERVERLESS
//  /api/contact.js — VERSION 4 — DESIGN PREMIUM SERIF
//
//  PDF elegant style AGS Concept (Times serif, navy/orange)
//  Compatible 100% Vercel serverless, aucune dependance
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

// ─── RÉFÉRENCE ───
function generateRef() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `AGS-${y}${m}${day}-${r}`;
}

// ─── PDF PREMIUM DESIGN ───
function generatePDF(data, refNum) {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const projectTypes = Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType;
  const budgetStr = Array.isArray(data.budget) ? data.budget.join(', ') : data.budget;
  const deadlineStr = Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline;
  const assetsStr = Array.isArray(data.existingAssets) && data.existingAssets.length > 0
    ? data.existingAssets.join(', ') : 'Aucun';

  const esc = (str) => String(str || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, ' ');

  const ops = [];
  let y = 842; // A4

  // Font references:
  // /F1 = Times-Roman (serif regular)
  // /F2 = Times-Bold (serif bold)
  // /F3 = Times-Italic (serif italic)
  // /F4 = Helvetica (sans-serif, for small labels)

  const text = (str, x, size, font = '/F1') => {
    ops.push(`BT ${font} ${size} Tf ${x} ${y} Td (${esc(str)}) Tj ET`);
  };

  const down = (gap = 16) => { y -= gap; };

  // ══════════════════════════════════════════
  // LEFT DECORATIVE BAR — orange accent
  // ══════════════════════════════════════════
  ops.push('0.878 0.404 0.196 rg'); // #E06732
  ops.push(`0 55 4 ${842 - 55 - 80} re f`);

  // ══════════════════════════════════════════
  // HEADER — Navy band (80pt tall)
  // ══════════════════════════════════════════
  ops.push('0.059 0.090 0.165 rg'); // #0F172A
  ops.push('0 762 595 80 re f');

  // Orange accent line under header
  ops.push('0.878 0.404 0.196 rg');
  ops.push('0 759 595 3 re f');

  // "AGS" in white bold serif
  y = 798;
  ops.push('1 1 1 rg');
  text('AGS', 50, 20, '/F2');

  // "Concept" in orange italic serif — positioned after "AGS"
  ops.push('0.878 0.404 0.196 rg');
  text('Concept', 93, 20, '/F3');

  // Subtitle
  y = 780;
  ops.push('0.584 0.620 0.678 rg'); // #94a3b8
  text('Solutions digitales sur mesure', 50, 7, '/F1');

  // Reference + date on right
  y = 798;
  ops.push('1 1 1 rg');
  text(refNum, 450, 10, '/F2');
  y = 782;
  ops.push('0.584 0.620 0.678 rg');
  text(date, 450, 8, '/F1');

  // ══════════════════════════════════════════
  // TITLE
  // ══════════════════════════════════════════
  y = 735;
  ops.push('0.059 0.090 0.165 rg');
  text('Fiche de demande client', 50, 15, '/F2');

  // Orange underline
  ops.push('0.878 0.404 0.196 rg');
  ops.push(`50 727 170 1.5 re f`);

  // ══════════════════════════════════════════
  // SECTION 1 — INFORMATIONS CLIENT
  // ══════════════════════════════════════════
  y = 703;
  ops.push('0.878 0.404 0.196 rg');
  // Orange dot
  ops.push(`47 ${y + 1} 3 3 re f`);
  text('Informations client', 54, 10, '/F2');
  // Thin orange underline
  ops.push(`54 ${y - 4} 110 0.5 re f`);

  down(20);

  // Light background box
  const box1Y = y - 78;
  ops.push('0.976 0.980 0.988 rg'); // #f9fafb
  ops.push(`45 ${box1Y} 505 98 re f`);
  // Orange left accent bar
  ops.push('0.878 0.404 0.196 rg');
  ops.push(`45 ${box1Y} 3 98 re f`);

  const clientInfo = [
    ['Nom complet', data.fullName],
    ['Societe', data.company],
    ['Email', data.email],
    ['Telephone', data.phone],
    ['Code postal', data.postalCode],
    ['Pays', data.country],
  ];

  clientInfo.forEach(([label, val]) => {
    ops.push('0.420 0.447 0.502 rg'); // #6b7280
    text(label, 62, 9, '/F4');
    ops.push('0.122 0.161 0.216 rg'); // #1f2937
    text(esc(val), 200, 9, '/F2');
    down(15);
  });

  // ══════════════════════════════════════════
  // SEPARATOR
  // ══════════════════════════════════════════
  down(14);
  ops.push('0.898 0.906 0.922 rg'); // #e5e7eb
  ops.push(`50 ${y} 500 0.5 re f`);

  // ══════════════════════════════════════════
  // SECTION 2 — DETAILS DU PROJET
  // ══════════════════════════════════════════
  down(22);
  ops.push('0.878 0.404 0.196 rg');
  ops.push(`47 ${y + 1} 3 3 re f`);
  text('Details du projet', 54, 10, '/F2');
  ops.push(`54 ${y - 4} 100 0.5 re f`);

  down(20);

  // Background box
  const box2Y = y - 48;
  ops.push('0.976 0.980 0.988 rg');
  ops.push(`45 ${box2Y} 505 72 re f`);
  ops.push('0.878 0.404 0.196 rg');
  ops.push(`45 ${box2Y} 3 72 re f`);

  const projectInfo = [
    ['Type de projet', projectTypes],
    ['Budget', budgetStr],
    ['Delai', deadlineStr],
    ['Elements existants', assetsStr],
  ];

  projectInfo.forEach(([label, val]) => {
    ops.push('0.420 0.447 0.502 rg');
    text(label, 62, 9, '/F4');
    ops.push('0.122 0.161 0.216 rg');
    const truncated = String(val || '').substring(0, 60);
    text(esc(truncated), 200, 9, '/F2');
    down(15);
  });

  // ══════════════════════════════════════════
  // SEPARATOR
  // ══════════════════════════════════════════
  down(14);
  ops.push('0.898 0.906 0.922 rg');
  ops.push(`50 ${y} 500 0.5 re f`);

  // ══════════════════════════════════════════
  // SECTION 3 — DESCRIPTION (if present)
  // ══════════════════════════════════════════
  if (data.description?.trim()) {
    down(22);
    ops.push('0.878 0.404 0.196 rg');
    ops.push(`47 ${y + 1} 3 3 re f`);
    text('Description du projet', 54, 10, '/F2');
    ops.push(`54 ${y - 4} 120 0.5 re f`);

    down(20);

    const desc = String(data.description).substring(0, 500);
    const descLines = [];
    const words = desc.split(' ');
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).length < 85) {
        line = (line + ' ' + w).trim();
      } else {
        descLines.push(line);
        line = w;
      }
    }
    if (line) descLines.push(line);

    const boxH = descLines.length * 15 + 16;
    const box3Y = y - boxH + 10;
    ops.push('0.976 0.980 0.988 rg');
    ops.push(`45 ${box3Y} 505 ${boxH} re f`);
    ops.push('0.878 0.404 0.196 rg');
    ops.push(`45 ${box3Y} 3 ${boxH} re f`);

    ops.push('0.216 0.255 0.318 rg'); // #374151
    descLines.forEach(l => {
      text(esc(l), 62, 9, '/F1');
      down(14);
    });
  }

  // ══════════════════════════════════════════
  // MERCI NOTE — warm background box
  // ══════════════════════════════════════════
  down(28);
  ops.push('0.996 0.969 0.957 rg'); // #FEF7F4
  ops.push(`45 ${y - 28} 505 35 re f`);
  ops.push('0.878 0.404 0.196 rg');
  text('Merci pour votre confiance. Notre equipe reviendra vers vous sous 24 a 48 heures.', 62, 9, '/F3');
  down(14);
  text('AGS Concept - A votre service.', 62, 9, '/F2');

  // ══════════════════════════════════════════
  // FOOTER — Orange line + Navy band
  // ══════════════════════════════════════════
  ops.push('0.878 0.404 0.196 rg');
  ops.push('0 53 595 2 re f');

  ops.push('0.059 0.090 0.165 rg');
  ops.push('0 0 595 53 re f');

  // Footer left
  y = 33;
  ops.push('0.584 0.620 0.678 rg');
  text('AGS Concept - Solutions digitales sur mesure', 50, 8, '/F1');
  y = 18;
  text('Document genere automatiquement - ' + new Date().getFullYear() + '  |  Tous droits reserves', 50, 7, '/F1');

  // Footer right
  y = 33;
  ops.push('0.878 0.404 0.196 rg');
  text('agsconcept@outlook.com', 410, 8, '/F2');
  y = 18;
  text('+33 7 82 92 86 20', 410, 8, '/F2');

  // ══════════════════════════════════════════
  // ASSEMBLE PDF with 4 fonts
  // ══════════════════════════════════════════
  const stream = ops.join('\n');
  const streamBytes = Buffer.byteLength(stream, 'binary');

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R /F4 8 0 R >> >> >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>\nendobj\n';
  const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>\nendobj\n';
  const obj7 = '7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>\nendobj\n';
  const obj8 = '8 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n';

  const header = '%PDF-1.4\n';
  const body = obj1 + obj2 + obj3 + obj4 + obj5 + obj6 + obj7 + obj8;

  const offsets = [];
  let pos = header.length;
  [obj1, obj2, obj3, obj4, obj5, obj6, obj7, obj8].forEach(obj => {
    offsets.push(pos);
    pos += obj.length;
  });

  const xrefStart = pos;
  const xref = `xref\n0 9\n0000000000 65535 f \n${offsets.map(o => String(o).padStart(10, '0') + ' 00000 n ').join('\n')}\n`;
  const trailer = `trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(header + body + xref + trailer, 'binary').toString('base64');
}

// ─── EMAIL INTERNE ───
async function sendInternalEmail(data, refNum, pdfBase64) {
  const projectTypes = Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType;
  const budgetStr = Array.isArray(data.budget) ? data.budget.join(', ') : data.budget;
  const deadlineStr = Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline;
  const assetsStr = Array.isArray(data.existingAssets) && data.existingAssets.length > 0 ? data.existingAssets.join(', ') : 'Aucun';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: process.env.AGS_SENDER_NAME || 'AGS Concept', email: process.env.AGS_SENDER_EMAIL },
      to: [{ email: process.env.AGS_INTERNAL_EMAIL }],
      subject: `Nouveau lead - ${data.fullName} (${data.company}) - ${refNum}`,
      htmlContent: `
        <div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto">
          <div style="background:#0F172A;padding:24px 28px;border-radius:8px 8px 0 0;border-bottom:3px solid #E06732">
            <h1 style="margin:0;font-size:20px"><span style="color:#fff;font-weight:bold">AGS</span><span style="color:#E06732;font-style:italic">Concept</span></h1>
            <p style="color:#94a3b8;margin:6px 0 0;font-size:13px">Nouvelle demande - Ref: ${refNum}</p>
          </div>
          <div style="padding:28px;border:1px solid #e5e7eb;border-top:none">
            <h3 style="color:#E06732;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 14px;border-left:3px solid #E06732;padding-left:10px">Client</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:130px">Nom</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.fullName}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Societe</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.company}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0;font-size:13px"><a href="mailto:${data.email}" style="color:#E06732">${data.email}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Telephone</td><td style="padding:6px 0;font-size:13px"><a href="tel:${data.phone}" style="color:#E06732">${data.phone}</a></td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Localisation</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.postalCode} - ${data.country}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
            <h3 style="color:#E06732;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 14px;border-left:3px solid #E06732;padding-left:10px">Projet</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Type</td><td style="padding:6px 0;font-size:13px;font-weight:600">${projectTypes}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Budget</td><td style="padding:6px 0;font-size:13px;font-weight:600">${budgetStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Delai</td><td style="padding:6px 0;font-size:13px;font-weight:600">${deadlineStr}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Elements existants</td><td style="padding:6px 0;font-size:13px;font-weight:600">${assetsStr}</td></tr>
            </table>
            ${data.description ? `<div style="background:#f8fafc;border-radius:8px;padding:16px;border-left:3px solid #E06732"><p style="margin:0 0 6px;font-size:11px;color:#E06732;font-weight:700;text-transform:uppercase;letter-spacing:1px">Description</p><p style="margin:0;font-size:13px;color:#374151;line-height:1.6">${data.description}</p></div>` : ''}
          </div>
          <div style="background:#0F172A;padding:14px 28px;border-radius:0 0 8px 8px;border-top:2px solid #E06732">
            <p style="margin:0;font-size:11px;color:#94a3b8">PDF en piece jointe - Repondre sous 24-48h</p>
          </div>
        </div>`,
      attachment: [{ content: pdfBase64, name: `AGS_Demande_${refNum}.pdf` }],
    }),
  });
  if (!response.ok) { const err = await response.text(); console.error('Erreur email interne:', err); throw new Error(`Email interne echoue: ${response.status}`); }
}

// ─── EMAIL CLIENT ───
async function sendClientEmail(data, refNum) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: process.env.AGS_SENDER_NAME || 'AGS Concept', email: process.env.AGS_SENDER_EMAIL },
      to: [{ email: data.email, name: data.fullName }],
      subject: `Votre demande ${refNum} - AGS Concept`,
      htmlContent: `
        <div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto">
          <div style="background:#0F172A;padding:32px;text-align:center;border-radius:8px 8px 0 0;border-bottom:3px solid #E06732">
            <h1 style="margin:0;font-size:24px"><span style="color:#fff;font-weight:bold">AGS</span><span style="color:#E06732;font-style:italic">Concept</span></h1>
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
          <div style="background:#0F172A;padding:20px 32px;text-align:center;border-radius:0 0 8px 8px;border-top:2px solid #E06732">
            <p style="color:#64748b;font-size:11px;margin:0">AGS Concept - Solutions digitales sur mesure</p>
            <p style="color:#E06732;font-size:11px;margin:4px 0 0;font-weight:600">agsconcept@outlook.com</p>
          </div>
        </div>`,
    }),
  });
  if (!response.ok) { const err = await response.text(); console.error('Erreur email client:', err); throw new Error(`Email client echoue: ${response.status}`); }
}

// ─── CRM BREVO ───
async function addToCRM(data, refNum) {
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        attributes: {
          FIRSTNAME: data.fullName.split(' ').slice(0, -1).join(' ') || data.fullName,
          LASTNAME: data.fullName.split(' ').slice(-1)[0] || '',
          SMS: data.phone, COMPANY: data.company, POSTAL_CODE: data.postalCode, COUNTRY: data.country,
          PROJECT_TYPE: Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType,
          BUDGET: Array.isArray(data.budget) ? data.budget.join(', ') : data.budget,
          DEADLINE: Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline,
          EXISTING_ASSETS: Array.isArray(data.existingAssets) ? data.existingAssets.join(', ') : '',
          REFERENCE: refNum, DESCRIPTION: data.description || '',
        },
        listIds: [2], updateEnabled: true,
      }),
    });
  } catch (err) { console.warn('CRM non critique:', err.message); }
}