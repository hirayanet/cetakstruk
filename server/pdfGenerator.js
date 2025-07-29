const PDFDocument = require('pdfkit');
const getStream = require('get-stream');

/**
 * Generate PDF buffer dari data transfer
 * @param {object} data
 * @returns {Promise<Buffer>}
 */
async function generatePDF(data) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  let buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // Judul
  doc.fontSize(18).text('BUKTI TRANSFER', { align: 'center' });
  doc.moveDown();

  // Data utama
  doc.fontSize(12);
  doc.text(`Tanggal: ${data.date || '-'}`);
  doc.text(`Bank Pengirim: ${data.senderBank || '-'}`);
  doc.text(`Nama Pengirim: ${data.senderName || '-'}`);
  doc.text(`Bank Tujuan: ${data.receiverBank || '-'}`);
  doc.text(`Nama Penerima: ${data.receiverName || '-'}`);
  doc.text(`No. Rekening/HP: ${data.receiverAccount || '-'}`);
  doc.text(`Jumlah: Rp ${data.amount ? data.amount.toLocaleString('id-ID') : '-'}`);
  doc.text(`Biaya Admin: Rp ${data.adminFee ? data.adminFee.toLocaleString('id-ID') : '0'}`);
  doc.text(`No. Referensi: ${data.referenceNumber || '-'}`);
  doc.moveDown();
  doc.text('---', { align: 'center' });
  doc.text('CetakResi.com', { align: 'center' });

  doc.end();
  return Buffer.concat(await getStream.array(doc));
}

module.exports = { generatePDF };
