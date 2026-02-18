// ============================================================
//  AGS CONCEPT — API BACKEND VERCEL SERVERLESS
//  /api/contact.js
//
//  Ce fichier reçoit les données du formulaire Angular,
//  génère un PDF, envoie les emails via Brevo et ajoute
//  le contact au CRM Brevo.
//
//  GRATUIT : Vercel Hobby + Brevo Free (300 emails/jour)
// ============================================================

import { jsPDF } from 'jspdf';

// ─── CONFIGURATION ───
// Variables d'environnement à définir dans Vercel Dashboard :
// BREVO_API_KEY       → Clé API Brevo
// AGS_INTERNAL_EMAIL  → Email interne AGS (ex: agsconcept@outlook.com)
// AGS_SENDER_EMAIL    → Email expéditeur vérifié dans Brevo
// AGS_SENDER_NAME     → "AGS Concept"

export default async function handler(req, res) {
  // CORS — permet à ton site Angular d'appeler cette API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    const data = req.body;

    // 1. Validation des données
    const errors = validatePayload(data);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }

    // 2. Générer la référence unique
    const refNum = generateRef();

    // 3. Générer le PDF professionnel
    const pdfBase64 = generatePDF(data, refNum);

    // 4. Envoyer l'email INTERNE (notification + PDF en PJ)
    await sendInternalEmail(data, refNum, pdfBase64);

    // 5. Envoyer l'email de CONFIRMATION au client
    await sendClientEmail(data, refNum);

    // 6. Ajouter le lead au CRM Brevo
    await addToCRM(data, refNum);

    // 7. Réponse succès
    return res.status(200).json({
      success: true,
      message: 'Votre demande a bien été envoyée.',
      reference: refNum,
    });

  } catch (error) {
    console.error('❌ Erreur workflow AGS:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors du traitement. Veuillez réessayer.',
    });
  }
}


// ─── VALIDATION (correspond exactement au payload Angular) ───

function validatePayload(data) {
  const errors = [];
  if (!data.fullName?.trim()) errors.push('Nom complet requis');
  if (!data.company?.trim()) errors.push('Société requise');
  if (!data.email?.trim() || !/\S+@\S+\.\S+/.test(data.email)) errors.push('Email invalide');
  if (!data.phone?.trim()) errors.push('Téléphone requis');
  if (!data.postalCode?.trim()) errors.push('Code postal requis');
  if (!data.country?.trim()) errors.push('Pays requis');
  if (!data.projectType?.length) errors.push('Type de projet requis');
  if (!data.budget?.length) errors.push('Budget requis');
  if (!data.deadline?.length) errors.push('Délai requis');
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


// ─── GÉNÉRATION PDF ───

function generatePDF(data, refNum) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const m = 20; // marge
  const cw = pw - m * 2; // largeur contenu
  let y = 20;

  // Couleurs AGS
  const navy = [15, 23, 42];     // #0F172A (ton bg navbar)
  const orange = [224, 103, 50];  // #E06732 (ton accent)
  const gray = [107, 114, 128];
  const dark = [31, 41, 55];

  // ── Header ──
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navy);
  doc.text('AGS', m, y);
  doc.setTextColor(...orange);
  doc.text('Concept', m + 25, y);

  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text(`Réf: ${refNum}`, pw - m, y - 5, { align: 'right' });
  doc.text(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), pw - m, y + 2, { align: 'right' });

  y += 8;
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.8);
  doc.line(m, y, pw - m, y);

  // ── Titre ──
  y += 14;
  doc.setFillColor(...navy);
  doc.roundedRect(m, y - 6, cw, 14, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('FICHE DE DEMANDE CLIENT', m + 8, y + 3);

  // ── Informations Client ──
  y += 22;
  doc.setFontSize(11);
  doc.setTextColor(...orange);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS CLIENT', m, y);

  y += 10;
  const clientFields = [
    ['Nom complet', data.fullName],
    ['Société', data.company],
    ['Email', data.email],
    ['Téléphone', data.phone],
    ['Code postal', data.postalCode],
    ['Pays', data.country],
  ];

  clientFields.forEach(([label, value]) => {
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.setFont('helvetica', 'normal');
    doc.text(label, m, y);
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value || '—'), m + 40, y);
    y += 7;
  });

  // ── Séparateur ──
  y += 4;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.line(m, y, pw - m, y);

  // ── Détails Projet ──
  y += 10;
  doc.setFontSize(11);
  doc.setTextColor(...orange);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS DU PROJET', m, y);

  y += 10;
  const projectFields = [
    ['Type de projet', Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType],
    ['Budget', Array.isArray(data.budget) ? data.budget.join(', ') : data.budget],
    ['Délai', Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline],
    ['Éléments existants', Array.isArray(data.existingAssets) && data.existingAssets.length > 0 ? data.existingAssets.join(', ') : 'Aucun'],
  ];

  projectFields.forEach(([label, value]) => {
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.setFont('helvetica', 'normal');
    doc.text(label, m, y);
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    const lines = doc.splitTextToSize(String(value || '—'), cw - 45);
    doc.text(lines, m + 45, y);
    y += lines.length * 5 + 4;
  });

  // ── Description ──
  if (data.description?.trim()) {
    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(...orange);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', m, y);

    y += 8;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(229, 231, 235);
    const descLines = doc.splitTextToSize(data.description, cw - 12);
    const descH = Math.max(descLines.length * 5 + 12, 20);
    doc.roundedRect(m, y - 4, cw, descH, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'normal');
    doc.text(descLines, m + 6, y + 3);
  }

  // ── Footer ──
  const fy = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.5);
  doc.line(m, fy - 5, pw - m, fy - 5);
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(`Document généré automatiquement — AGS Concept © ${new Date().getFullYear()}`, m, fy);
  doc.setTextColor(...orange);
  doc.setFont('helvetica', 'bold');
  doc.text('agsconcept@outlook.com', pw - m, fy, { align: 'right' });

  // Retourner en base64
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer).toString('base64');
}


// ─── EMAIL INTERNE (notification avec PDF) ───

async function sendInternalEmail(data, refNum, pdfBase64) {
  const projectTypes = Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType;
  const budgetStr = Array.isArray(data.budget) ? data.budget.join(', ') : data.budget;
  const deadlineStr = Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline;
  const assetsStr = Array.isArray(data.existingAssets) && data.existingAssets.length > 0
    ? data.existingAssets.join(', ') : 'Aucun';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.AGS_SENDER_NAME || 'AGS Concept',
        email: process.env.AGS_SENDER_EMAIL,
      },
      to: [{ email: process.env.AGS_INTERNAL_EMAIL }],
      subject: `🔔 Nouveau lead — ${data.fullName} (${data.company}) — ${refNum}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #fff;">
          <!-- Header -->
          <div style="background: #0F172A; padding: 24px 28px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #E06732; margin: 0; font-size: 20px; font-weight: 800;">
              Nouvelle demande client
            </h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">
              Réf: ${refNum} — ${new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 28px; border: 1px solid #e5e7eb; border-top: none;">
            <!-- Client -->
            <h3 style="color: #E06732; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px;">
              Client
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${[
                ['Nom', data.fullName],
                ['Société', data.company],
                ['Email', `<a href="mailto:${data.email}" style="color: #E06732;">${data.email}</a>`],
                ['Téléphone', `<a href="tel:${data.phone}" style="color: #E06732;">${data.phone}</a>`],
                ['Localisation', `${data.postalCode} — ${data.country}`],
              ].map(([l, v]) => `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 120px;">${l}</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">${v}</td>
                </tr>
              `).join('')}
            </table>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">

            <!-- Projet -->
            <h3 style="color: #E06732; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px;">
              Projet
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${[
                ['Type', projectTypes],
                ['Budget', budgetStr],
                ['Délai', deadlineStr],
                ['Éléments existants', assetsStr],
              ].map(([l, v]) => `
                <tr>
                  <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 140px;">${l}</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1f2937;">${v}</td>
                </tr>
              `).join('')}
            </table>

            ${data.description ? `
              <div style="background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb; margin-top: 8px;">
                <p style="margin: 0 0 6px; font-size: 11px; color: #E06732; font-weight: 700; text-transform: uppercase;">
                  Description
                </p>
                <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6;">
                  ${data.description}
                </p>
              </div>
            ` : ''}
          </div>

          <!-- Footer -->
          <div style="background: #f9fafb; padding: 14px 28px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0; font-size: 11px; color: #9ca3af;">
              📎 PDF de la demande en pièce jointe — Répondre sous 24-48h
            </p>
          </div>
        </div>
      `,
      attachment: [{
        content: pdfBase64,
        name: `AGS_Demande_${refNum}.pdf`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erreur email interne:', err);
    throw new Error(`Email interne échoué: ${response.status}`);
  }
}


// ─── EMAIL CLIENT (confirmation) ───

async function sendClientEmail(data, refNum) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.AGS_SENDER_NAME || 'AGS Concept',
        email: process.env.AGS_SENDER_EMAIL,
      },
      to: [{ email: data.email, name: data.fullName }],
      subject: `Votre demande ${refNum} a bien été reçue — AGS Concept`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <!-- Header -->
          <div style="background: #0F172A; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #E06732; margin: 0; font-size: 24px; font-weight: 800;">
              AGS Concept
            </h1>
            <p style="color: #94a3b8; margin: 8px 0 0; font-size: 13px;">
              Votre demande a bien été reçue
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; color: #0F172A; margin: 0 0 16px;">
              Bonjour <strong>${data.fullName}</strong>,
            </p>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0 0 24px;">
              Nous avons bien reçu votre demande concernant
              <strong style="color: #E06732;">
                ${Array.isArray(data.projectType) ? data.projectType.join(', ') : data.projectType}
              </strong>.
              Notre équipe analyse votre projet et reviendra vers vous dans les
              <strong>24 à 48 heures</strong>.
            </p>

            <!-- Référence -->
            <div style="background: #FDF0EA; border-radius: 8px; padding: 18px 24px; border-left: 4px solid #E06732;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">Votre référence</p>
              <p style="margin: 6px 0 0; font-size: 20px; font-weight: 800; color: #0F172A; font-family: monospace;">
                ${refNum}
              </p>
            </div>

            <p style="font-size: 13px; color: #6b7280; margin: 24px 0 0; line-height: 1.6;">
              Conservez cette référence pour tout échange futur avec notre équipe.
              <br>N'hésitez pas à nous contacter directement au
              <a href="tel:+33782928620" style="color: #E06732; font-weight: 600;">+33 7 82 92 86 20</a>.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #0F172A; padding: 20px 32px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #64748b; font-size: 11px; margin: 0;">
              AGS Concept — Solutions digitales sur mesure
            </p>
            <p style="color: #E06732; font-size: 11px; margin: 4px 0 0; font-weight: 600;">
              agsconcept@outlook.com · +33 7 82 92 86 20
            </p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Erreur email client:', err);
    throw new Error(`Email client échoué: ${response.status}`);
  }
}


// ─── CRM BREVO (ajout du contact) ───

async function addToCRM(data, refNum) {
  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
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
        listIds: [2], // ID de ta liste "Leads" dans Brevo (à adapter)
        updateEnabled: true, // Met à jour si le contact existe déjà
      }),
    });

    if (!response.ok && response.status !== 201 && response.status !== 204) {
      console.warn('CRM warning:', await response.text());
    }
  } catch (err) {
    // Le CRM ne doit pas bloquer le workflow
    console.warn('CRM non critique, erreur ignorée:', err.message);
  }
}
