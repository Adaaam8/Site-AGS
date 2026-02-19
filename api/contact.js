// AGS CONCEPT — API v5 — ACCENTS FR + DESIGN FIX
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Methode non autorisee' });

  try {
    const data = req.body;
    const errors = validatePayload(data);
    if (errors.length > 0) return res.status(400).json({ success: false, error: errors.join(', ') });
    const refNum = generateRef();
    const pdfBase64 = generatePDF(data, refNum);
    await sendInternalEmail(data, refNum, pdfBase64);
    await sendClientEmail(data, refNum);
    await addToCRM(data, refNum);
    return res.status(200).json({ success: true, message: 'Votre demande a bien ete envoyee.', reference: refNum });
  } catch (error) {
    console.error('Erreur workflow AGS:', error);
    return res.status(500).json({ success: false, error: 'Une erreur est survenue lors du traitement. Veuillez reessayer.' });
  }
}

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

function generateRef() {
  const d = new Date();
  const y = d.getFullYear().toString().slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = Math.floor(1000 + Math.random() * 9000);
  return `AGS-${y}${m}${day}-${r}`;
}

// WinAnsiEncoding for French accents
function toWinAnsi(str) {
  const map = {'\u00C0':0xC0,'\u00C1':0xC1,'\u00C2':0xC2,'\u00C4':0xC4,'\u00C7':0xC7,'\u00C8':0xC8,'\u00C9':0xC9,'\u00CA':0xCA,'\u00CB':0xCB,'\u00CE':0xCE,'\u00CF':0xCF,'\u00D4':0xD4,'\u00D9':0xD9,'\u00DB':0xDB,'\u00DC':0xDC,'\u00E0':0xE0,'\u00E1':0xE1,'\u00E2':0xE2,'\u00E4':0xE4,'\u00E7':0xE7,'\u00E8':0xE8,'\u00E9':0xE9,'\u00EA':0xEA,'\u00EB':0xEB,'\u00EE':0xEE,'\u00EF':0xEF,'\u00F4':0xF4,'\u00F9':0xF9,'\u00FB':0xFB,'\u00FC':0xFC,'\u00FF':0xFF,'\u0152':0x8C,'\u0153':0x9C,'\u20AC':0x80,'\u2013':0x96,'\u2014':0x97,'\u2018':0x91,'\u2019':0x92,'\u201C':0x93,'\u201D':0x94,'\u2026':0x85};
  const bytes = [];
  for (const ch of String(str || '')) {
    const code = ch.charCodeAt(0);
    if (code < 0x80) bytes.push(code);
    else if (map[ch] !== undefined) bytes.push(map[ch]);
    else bytes.push(0x3F);
  }
  return Buffer.from(bytes);
}

function escPdf(str) {
  const buf = toWinAnsi(str);
  let out = '';
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b === 0x28) out += '\\(';
    else if (b === 0x29) out += '\\)';
    else if (b === 0x5C) out += '\\\\';
    else if (b >= 0x20 && b < 0x7F) out += String.fromCharCode(b);
    else out += '\\' + b.toString(8).padStart(3, '0');
  }
  return out;
}

function generatePDF(data, refNum) {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const projectTypes = Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType;
  const budgetStr = Array.isArray(data.budget) ? data.budget.join(', ') : data.budget;
  const deadlineStr = Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline;
  const assetsStr = Array.isArray(data.existingAssets) && data.existingAssets.length > 0 ? data.existingAssets.join(', ') : 'Aucun';

  const ops = [];
  let y = 842;
  const text = (str, x, size, font = '/F1') => { ops.push(`BT ${font} ${size} Tf ${x} ${y} Td (${escPdf(str)}) Tj ET`); };
  const down = (gap = 16) => { y -= gap; };

  // Left bar
  ops.push('0.878 0.404 0.196 rg');
  ops.push('0 55 4 707 re f');

  // Header navy
  ops.push('0.059 0.090 0.165 rg');
  ops.push('0 762 595 80 re f');
  ops.push('0.878 0.404 0.196 rg');
  ops.push('0 759 595 3 re f');

  // AGS Concept
  y = 798;
  ops.push('1 1 1 rg');
  text('AGS', 50, 20, '/F2');
  ops.push('0.878 0.404 0.196 rg');
  text('Concept', 93, 20, '/F3');
  y = 780;
  ops.push('0.584 0.620 0.678 rg');
  text('Solutions digitales sur mesure', 50, 7, '/F1');

  y = 798;
  ops.push('1 1 1 rg');
  text(refNum, 450, 10, '/F2');
  y = 782;
  ops.push('0.584 0.620 0.678 rg');
  text(date, 450, 8, '/F1');

  // Title
  y = 735;
  ops.push('0.059 0.090 0.165 rg');
  text('Fiche de demande client', 50, 15, '/F2');
  ops.push('0.878 0.404 0.196 rg');
  ops.push('50 727 170 1.5 re f');

  // Section 1
  y = 703;
  ops.push('0.878 0.404 0.196 rg');
  ops.push(`47 ${y+1} 3 3 re f`);
  text('Informations client', 54, 10, '/F2');
  ops.push(`54 ${y-4} 110 0.5 re f`);
  down(20);

  const box1Top = y + 6;
  ops.push('0.976 0.980 0.988 rg');
  ops.push(`45 ${box1Top - 98} 505 98 re f`);
  ops.push('0.878 0.404 0.196 rg');
  ops.push(`45 ${box1Top - 98} 3 98 re f`);

  [['Nom complet', data.fullName], ['Soci\u00e9t\u00e9', data.company], ['Email', data.email], ['T\u00e9l\u00e9phone', data.phone], ['Code postal', data.postalCode], ['Pays', data.country]].forEach(([l, v]) => {
    ops.push('0.420 0.447 0.502 rg'); text(l, 62, 9, '/F4');
    ops.push('0.122 0.161 0.216 rg'); text(v, 200, 9, '/F2');
    down(15);
  });

  // Separator
  down(14);
  ops.push('0.898 0.906 0.922 rg');
  ops.push(`50 ${y} 500 0.5 re f`);

  // Section 2
  down(22);
  ops.push('0.878 0.404 0.196 rg');
  ops.push(`47 ${y+1} 3 3 re f`);
  text('D\u00e9tails du projet', 54, 10, '/F2');
  ops.push(`54 ${y-4} 105 0.5 re f`);
  down(20);

  const box2Top = y + 6;
  ops.push('0.976 0.980 0.988 rg');
  ops.push(`45 ${box2Top - 72} 505 72 re f`);
  ops.push('0.878 0.404 0.196 rg');
  ops.push(`45 ${box2Top - 72} 3 72 re f`);

  [['Type de projet', projectTypes], ['Budget', budgetStr], ['D\u00e9lai', deadlineStr], ['\u00c9l\u00e9ments existants', assetsStr]].forEach(([l, v]) => {
    ops.push('0.420 0.447 0.502 rg'); text(l, 62, 9, '/F4');
    ops.push('0.122 0.161 0.216 rg'); text(String(v||'').substring(0,60), 200, 9, '/F2');
    down(15);
  });

  // Separator
  down(14);
  ops.push('0.898 0.906 0.922 rg');
  ops.push(`50 ${y} 500 0.5 re f`);

  // Description
  if (data.description?.trim()) {
    down(22);
    ops.push('0.878 0.404 0.196 rg');
    ops.push(`47 ${y+1} 3 3 re f`);
    text('Description du projet', 54, 10, '/F2');
    ops.push(`54 ${y-4} 120 0.5 re f`);
    down(20);

    const desc = String(data.description).substring(0, 500);
    const descLines = []; const words = desc.split(' '); let line = '';
    for (const w of words) { if ((line + ' ' + w).length < 85) { line = (line + ' ' + w).trim(); } else { descLines.push(line); line = w; } }
    if (line) descLines.push(line);

    const boxH = descLines.length * 15 + 16;
    const box3Top = y + 6;
    ops.push('0.976 0.980 0.988 rg');
    ops.push(`45 ${box3Top - boxH} 505 ${boxH} re f`);
    ops.push('0.878 0.404 0.196 rg');
    ops.push(`45 ${box3Top - boxH} 3 ${boxH} re f`);

    ops.push('0.216 0.255 0.318 rg');
    descLines.forEach(l => { text(l, 62, 9, '/F1'); down(14); });
  }

  // Merci note
  down(28);
  ops.push('0.996 0.969 0.957 rg');
  ops.push(`45 ${y-28} 505 35 re f`);
  ops.push('0.878 0.404 0.196 rg');
  text('Merci pour votre confiance. Notre \u00e9quipe reviendra vers vous sous 24 \u00e0 48 heures.', 62, 9, '/F3');
  down(14);
  text('AGS Concept - \u00c0 votre service.', 62, 9, '/F2');

  // Footer
  ops.push('0.878 0.404 0.196 rg');
  ops.push('0 53 595 2 re f');
  ops.push('0.059 0.090 0.165 rg');
  ops.push('0 0 595 53 re f');

  y = 33;
  ops.push('0.584 0.620 0.678 rg');
  text('AGS Concept - Solutions digitales sur mesure', 50, 8, '/F1');
  y = 18;
  text('Document g\u00e9n\u00e9r\u00e9 automatiquement - ' + new Date().getFullYear() + '  |  Tous droits r\u00e9serv\u00e9s', 50, 7, '/F1');
  y = 33;
  ops.push('0.878 0.404 0.196 rg');
  text('contact@ags-concept.com', 400, 8, '/F2');
  y = 18;
  text('+33 7 82 92 86 20', 400, 8, '/F2');

  // Assemble
  const stream = ops.join('\n');
  const streamBytes = Buffer.byteLength(stream, 'binary');
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R /F3 7 0 R /F4 8 0 R >> >> >>\nendobj\n';
  const obj4 = `4 0 obj\n<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>\nendobj\n';
  const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>\nendobj\n';
  const obj7 = '7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>\nendobj\n';
  const obj8 = '8 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n';

  const header = '%PDF-1.4\n';
  const body = obj1 + obj2 + obj3 + obj4 + obj5 + obj6 + obj7 + obj8;
  const offsets = []; let pos = header.length;
  [obj1,obj2,obj3,obj4,obj5,obj6,obj7,obj8].forEach(obj => { offsets.push(pos); pos += obj.length; });
  const xrefStart = pos;
  const xref = `xref\n0 9\n0000000000 65535 f \n${offsets.map(o => String(o).padStart(10,'0') + ' 00000 n ').join('\n')}\n`;
  const trailer = `trailer\n<< /Size 9 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(header + body + xref + trailer, 'binary').toString('base64');
}

// Email interne
async function sendInternalEmail(data, refNum, pdfBase64) {
  const projectTypes = Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType;
  const budgetStr = Array.isArray(data.budget) ? data.budget.join(', ') : data.budget;
  const deadlineStr = Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline;
  const assetsStr = Array.isArray(data.existingAssets) && data.existingAssets.length > 0 ? data.existingAssets.join(', ') : 'Aucun';
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST', headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: process.env.AGS_SENDER_NAME || 'AGS Concept', email: process.env.AGS_SENDER_EMAIL },
      to: [{ email: process.env.AGS_INTERNAL_EMAIL }],
      subject: `Nouveau lead - ${data.fullName} (${data.company}) - ${refNum}`,
      htmlContent: `<div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto"><div style="background:#0F172A;padding:24px 28px;border-radius:8px 8px 0 0;border-bottom:3px solid #E06732"><h1 style="margin:0;font-size:20px"><span style="color:#fff;font-weight:bold">AGS</span> <span style="color:#E06732;font-style:italic">Concept</span></h1><p style="color:#94a3b8;margin:6px 0 0;font-size:13px">Nouvelle demande - R&eacute;f: ${refNum}</p></div><div style="padding:28px;border:1px solid #e5e7eb;border-top:none"><h3 style="color:#E06732;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 14px;border-left:3px solid #E06732;padding-left:10px">Client</h3><table style="width:100%;border-collapse:collapse;margin-bottom:20px"><tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:130px">Nom</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.fullName}</td></tr><tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Soci&eacute;t&eacute;</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.company}</td></tr><tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Email</td><td style="padding:6px 0;font-size:13px"><a href="mailto:${data.email}" style="color:#E06732">${data.email}</a></td></tr><tr><td style="padding:6px 0;color:#6b7280;font-size:13px">T&eacute;l&eacute;phone</td><td style="padding:6px 0;font-size:13px"><a href="tel:${data.phone}" style="color:#E06732">${data.phone}</a></td></tr><tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Localisation</td><td style="padding:6px 0;font-size:13px;font-weight:600">${data.postalCode} - ${data.country}</td></tr></table><hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"><h3 style="color:#E06732;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 14px;border-left:3px solid #E06732;padding-left:10px">Projet</h3><table style="width:100%;border-collapse:collapse;margin-bottom:20px"><tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px">Type</td><td style="padding:6px 0;font-size:13px;font-weight:600">${projectTypes}</td></tr><tr><td style="padding:6px 0;color:#6b7280;font-size:13px">Budget</td><td style="padding:6px 0;font-size:13px;font-weight:600">${budgetStr}</td></tr><tr><td style="padding:6px 0;color:#6b7280;font-size:13px">D&eacute;lai</td><td style="padding:6px 0;font-size:13px;font-weight:600">${deadlineStr}</td></tr><tr><td style="padding:6px 0;color:#6b7280;font-size:13px">&Eacute;l&eacute;ments existants</td><td style="padding:6px 0;font-size:13px;font-weight:600">${assetsStr}</td></tr></table>${data.description ? `<div style="background:#f8fafc;border-radius:8px;padding:16px;border-left:3px solid #E06732"><p style="margin:0 0 6px;font-size:11px;color:#E06732;font-weight:700;text-transform:uppercase;letter-spacing:1px">Description</p><p style="margin:0;font-size:13px;color:#374151;line-height:1.6">${data.description}</p></div>` : ''}</div><div style="background:#0F172A;padding:14px 28px;border-radius:0 0 8px 8px;border-top:2px solid #E06732"><p style="margin:0;font-size:11px;color:#94a3b8">PDF en pi&egrave;ce jointe</p></div></div>`,
      attachment: [{ content: pdfBase64, name: `AGS_Demande_${refNum}.pdf` }],
    }),
  });
  if (!response.ok) { const err = await response.text(); console.error('Erreur email interne:', err); throw new Error(`Email interne echoue: ${response.status}`); }
}

// Email client
async function sendClientEmail(data, refNum) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST', headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: process.env.AGS_SENDER_NAME || 'AGS Concept', email: process.env.AGS_SENDER_EMAIL },
      to: [{ email: data.email, name: data.fullName }],
      subject: `Votre demande ${refNum} - AGS Concept`,
      htmlContent: `<div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto"><div style="background:#0F172A;padding:32px;text-align:center;border-radius:8px 8px 0 0;border-bottom:3px solid #E06732"><h1 style="margin:0;font-size:24px"><span style="color:#fff;font-weight:bold">AGS</span> <span style="color:#E06732;font-style:italic">Concept</span></h1><p style="color:#94a3b8;margin:8px 0 0;font-size:13px">Votre demande a bien &eacute;t&eacute; re&ccedil;ue</p></div><div style="padding:32px;border:1px solid #e5e7eb;border-top:none"><p style="font-size:16px;color:#0F172A;margin:0 0 16px">Bonjour <strong>${data.fullName}</strong>,</p><p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px">Nous avons bien re&ccedil;u votre demande concernant <strong style="color:#E06732">${Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType}</strong>. Notre &eacute;quipe analyse votre projet et reviendra vers vous dans les <strong>24 &agrave; 48 heures</strong>.</p><div style="background:#FDF0EA;border-radius:8px;padding:18px 24px;border-left:4px solid #E06732"><p style="margin:0;font-size:12px;color:#9ca3af">Votre r&eacute;f&eacute;rence</p><p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#0F172A;font-family:monospace">${refNum}</p></div><p style="font-size:13px;color:#6b7280;margin:24px 0 0;line-height:1.6">Conservez cette r&eacute;f&eacute;rence pour tout &eacute;change futur. Contactez-nous au <a href="tel:+33782928620" style="color:#E06732;font-weight:600">+33 7 82 92 86 20</a>.</p></div><div style="background:#0F172A;padding:20px 32px;text-align:center;border-radius:0 0 8px 8px;border-top:2px solid #E06732"><p style="color:#64748b;font-size:11px;margin:0">AGS Concept - Solutions digitales sur mesure</p><p style="color:#E06732;font-size:11px;margin:4px 0 0;font-weight:600">contact@ags-concept.com</p></div></div>`,
    }),
  });
  if (!response.ok) { const err = await response.text(); console.error('Erreur email client:', err); throw new Error(`Email client echoue: ${response.status}`); }
}

// CRM
async function addToCRM(data, refNum) {
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST', headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        attributes: {
          FIRSTNAME: data.fullName.split(' ').slice(0,-1).join(' ') || data.fullName,
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