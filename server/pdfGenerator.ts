import PDFDocument from 'pdfkit';
import getStream from 'get-stream';
import { PassThrough } from 'stream';

export async function generatePDF(data: any): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const stream = new PassThrough();
  doc.pipe(stream);

  doc.fontSize(18).text('BUKTI TRANSFER', { align: 'center' });
  doc.moveDown();

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

  // Manual buffer collect
  const chunks: Buffer[] = [];
  return await new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
