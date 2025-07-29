const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const router = express.Router();

// Helper: inject data ke HTML template
function injectDataToHtml(html, data) {
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
router.post('/generate-pdf-html', async (req, res) => {
  try {
    const data = req.body;
    const templatePath = path.join(__dirname, 'pdf-template.html');
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
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
});

module.exports = router;
