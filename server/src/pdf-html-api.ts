import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

const router = express.Router();
console.log('[DEBUG] pdf-html-api.ts loaded');

// Helper: inject data ke HTML template
function injectDataToHtml(html: string, data: any) {
  return html
    .replace('id="date">-', `id="date">${data.date || '-'}`)
    .replace('id="time">-', `id="time">${data.time || '-'}`)
    .replace('id="senderName">-', `id="senderName">${data.senderName || '-'}`)
    .replace('id="receiverName">-', `id="receiverName">${data.receiverName || '-'}`)
    .replace('id="receiverBank">-', `id="receiverBank">${data.receiverBank || '-'}`)
    .replace('id="receiverAccount">-', `id="receiverAccount">${data.receiverAccount || '-'}`)
    .replace('id="referenceNumber">-', `id="referenceNumber">${data.referenceNumber || '-'}`)
    .replace('id="amount">-', `id="amount">Rp ${data.amount ? Number(data.amount).toLocaleString('id-ID') : '-'}`)
    .replace('id="adminFee">-', `id="adminFee">Rp ${data.adminFee ? Number(data.adminFee).toLocaleString('id-ID') : '0'}`)
    .replace('id="totalAmount">-', `id="totalAmount">Rp ${data.amount && data.adminFee ? Number(data.amount + data.adminFee).toLocaleString('id-ID') : '-'}`)
    .replace('id="printedAt">-', `id="printedAt">${new Date().toLocaleString('id-ID')}`);
}

// Endpoint: POST /api/generate-pdf-html
router.post('/generate-pdf-html', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const templatePath = path.join(__dirname, '../pdf-template.html');
    let html = fs.readFileSync(templatePath, 'utf-8');
    html = injectDataToHtml(html, data);

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Ukuran thermal printer (80mm lebar)
    await page.setViewport({ width: 302, height: 600 });
    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: '80mm',
      height: 'auto',
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      pageRanges: '1',
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="bukti-transfer.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[PDF HTML API]', error);
    let msg = 'Internal server error';
    if (error instanceof Error) msg = error.message;
    res.status(500).json({ success: false, message: msg });
  }
});

export default router;

import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

const router = express.Router();
console.log('[DEBUG] pdf-html-api.ts loaded');

// Helper: inject data ke HTML template
function injectDataToHtml(html: string, data: any) {
  return html
    .replace('id="date">-', `id="date">${data.date || '-'}`)
    .replace('id="time">-', `id="time">${data.time || '-'}`)
    .replace('id="senderName">-', `id="senderName">${data.senderName || '-'}`)
    .replace('id="receiverName">-', `id="receiverName">${data.receiverName || '-'}`)
    .replace('id="receiverBank">-', `id="receiverBank">${data.receiverBank || '-'}`)
    .replace('id="receiverAccount">-', `id="receiverAccount">${data.receiverAccount || '-'}`)
    .replace('id="referenceNumber">-', `id="referenceNumber">${data.referenceNumber || '-'}`)
    .replace('id="amount">-', `id="amount">Rp ${data.amount ? Number(data.amount).toLocaleString('id-ID') : '-'}`)
    .replace('id="adminFee">-', `id="adminFee">Rp ${data.adminFee ? Number(data.adminFee).toLocaleString('id-ID') : '0'}`)
    .replace('id="totalAmount">-', `id="totalAmount">Rp ${data.amount && data.adminFee ? Number(data.amount + data.adminFee).toLocaleString('id-ID') : '-'}`)
    .replace('id="printedAt">-', `id="printedAt">${new Date().toLocaleString('id-ID')}`);
}

  // Replace id="field" innerText
  return html
    .replace('id="date">-', `id="date">${data.date || '-'}`)
    .replace('id="time">-', `id="time">${data.time || '-'}`)
    .replace('id="senderName">-', `id="senderName">${data.senderName || '-'}`)
    .replace('id="receiverName">-', `id="receiverName">${data.receiverName || '-'}`)
    .replace('id="receiverBank">-', `id="receiverBank">${data.receiverBank || '-'}`)
    .replace('id="receiverAccount">-', `id="receiverAccount">${data.receiverAccount || '-'}`)
    .replace('id="referenceNumber">-', `id="referenceNumber">${data.referenceNumber || '-'}`)
    .replace('id="amount">-', `id="amount">Rp ${data.amount ? Number(data.amount).toLocaleString('id-ID') : '-'}`)
    .replace('id="adminFee">-', `id="adminFee">Rp ${data.adminFee ? Number(data.adminFee).toLocaleString('id-ID') : '0'}`)
    .replace('id="totalAmount">-', `id="totalAmount">Rp ${data.amount && data.adminFee ? Number(data.amount + data.adminFee).toLocaleString('id-ID') : '-'}`)
    .replace('id="printedAt">-', `id="printedAt">${new Date().toLocaleString('id-ID')}`);
}

// Endpoint: POST /api/generate-pdf-html
router.post('/generate-pdf-html', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const templatePath = path.join(__dirname, '../pdf-template.html');
    let html = fs.readFileSync(templatePath, 'utf-8');
    html = injectDataToHtml(html, data);

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Ukuran thermal printer (80mm lebar)
    await page.setViewport({ width: 302, height: 600 });
    const pdfBuffer = await page.pdf({
      printBackground: true,
      width: '80mm',
      height: 'auto',
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      pageRanges: '1',
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="bukti-transfer.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[PDF HTML API]', error);
    let msg = 'Internal server error';
    if (error instanceof Error) msg = error.message;
    res.status(500).json({ success: false, message: msg });
  }
});

export default router;
