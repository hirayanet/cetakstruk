import React from 'react';
import { Printer, Download, CheckCircle, Share2 } from 'lucide-react';
import { TransferData } from '../types/TransferData';
import { uploadReceiptToCloudinary, generateFileName } from '../utils/cloudinaryUpload';

interface ReceiptPreviewProps {
  transferData: TransferData;
}

export default function ReceiptPreview({ transferData }: ReceiptPreviewProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const totalAmount = transferData.amount + transferData.adminFee;
  const currentDateTime = new Date().toLocaleString('id-ID');

  const handlePrint = () => {
    try {
      // Add print class berdasarkan paper size
      document.body.classList.add('printing');
      if (transferData.paperSize === '58mm') {
        document.body.classList.add('printing-58mm');
      }
      
      setTimeout(() => {
        window.print();
        
        // Remove print class after printing
        setTimeout(() => {
          document.body.classList.remove('printing', 'printing-58mm');
        }, 1000);
      }, 100);
    } catch (error) {
      console.error('❌ Print Error:', error);
      alert('Gagal mencetak. Pastikan printer sudah terhubung.');
      document.body.classList.remove('printing', 'printing-58mm');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const receiptElement = document.querySelector('.receipt-content') as HTMLElement;
      if (!receiptElement) {
        throw new Error('Receipt content not found');
      }

      // Capture dengan setting yang lebih optimal
      const canvas = await html2canvas(receiptElement, {
        scale: 3, // Tingkatkan kualitas
        useCORS: true,
        backgroundColor: '#ffffff',
        width: receiptElement.offsetWidth,
        height: receiptElement.offsetHeight,
        logging: false // Disable logging
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // PDF size yang lebih akurat untuk thermal printer
      const pdfWidth = transferData.paperSize === '58mm' ? 58 : 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, Math.max(pdfHeight, 100)] // Minimal height 100mm
      });

      // Add image dengan margin kecil
      pdf.addImage(imgData, 'PNG', 1, 1, pdfWidth - 2, pdfHeight - 2);
      
      // Filename dengan timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      pdf.save(`struk-${transferData.bankType}-${timestamp}.pdf`);
      
      console.log('✅ PDF saved successfully');
      alert('✅ PDF berhasil disimpan!');
    } catch (error) {
      console.error('❌ PDF Error:', error);
      alert('❌ Gagal menyimpan PDF. Coba lagi atau gunakan print browser.');
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      console.log('🚀 Starting WhatsApp share process...');
      
      const html2canvas = (await import('html2canvas')).default;
      
      const receiptElement = document.querySelector('.receipt-content') as HTMLElement;
      if (!receiptElement) {
        throw new Error('Receipt content not found');
      }

      // Show loading state
      const shareButton = document.querySelector('[data-share-button]') as HTMLButtonElement;
      if (shareButton) {
        shareButton.textContent = 'Uploading...';
        shareButton.disabled = true;
      }

      // Capture receipt sebagai image
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: receiptElement.offsetWidth,
        height: receiptElement.offsetHeight,
        logging: false
      });

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }

        try {
          // Upload to Cloudinary
          const fileName = generateFileName(transferData.bankType);
          const imageUrl = await uploadReceiptToCloudinary(blob, fileName);
          
          // Create WhatsApp message with compatible emojis
          const message = `📄 *BUKTI TRANSFER - JASA HRY*\n\n` +
            `✅ Transfer berhasil!\n` +
            `💰 Jumlah: Rp ${formatNumber(transferData.amount)}\n` +
            `👤 Dari: ${transferData.senderName}\n` +
            `👤 Ke: ${transferData.receiverName}\n` +
            `🏦 Bank: ${transferData.receiverBank}\n` +
            `📅 Tanggal: ${transferData.date}\n\n` +
            `📎 Lihat struk lengkap: ${imageUrl}\n\n` +
            `Terima kasih telah menggunakan JASA HRY! 🙏`;
          
          // Open WhatsApp with message
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          
          console.log('✅ WhatsApp share completed!');
          alert('✅ Struk berhasil diupload! WhatsApp terbuka dengan link struk.');
          
        } catch (uploadError) {
          console.error('❌ Upload failed:', uploadError);
          alert('❌ Gagal upload struk. Coba lagi atau gunakan Simpan PDF.');
        } finally {
          // Reset button
          if (shareButton) {
            shareButton.textContent = 'Share WhatsApp';
            shareButton.disabled = false;
          }
        }
      }, 'image/png', 0.9);
      
    } catch (error) {
      console.error('❌ WhatsApp Share Error:', error);
      alert('❌ Gagal share ke WhatsApp. Coba gunakan Simpan PDF.');
    }
  };

  const receiptWidth = transferData.paperSize === '58mm' ? 'w-48' : 'w-64';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={handlePrint}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Printer className="w-5 h-5 mr-2" />
          Cetak Langsung
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Simpan PDF
        </button>
        <button
          onClick={handleShareWhatsApp}
          data-share-button
          className="flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share WhatsApp
        </button>
      </div>

      <div className="flex justify-center">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div className={`${receiptWidth} bg-white p-4 print:p-2 receipt-content`}>
            <div className="text-center border-b border-gray-300 pb-3 mb-3">
              <h1 className="text-lg font-bold">JASA HRY</h1>
              <p className="text-xs text-gray-600">Kirim Uang & Pembayaran</p>
              <p className="text-xs text-gray-600">Cepat • Aman • Terpercaya</p>
            </div>

            <div className="text-center mb-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <p className="text-sm font-semibold text-green-600">KIRIM UANG BERHASIL</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span className="font-mono">{transferData.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span className="font-mono">{transferData.time || currentDateTime.split(' ')[1]}</span>
              </div>
              <div className="flex justify-between">
                <span>Pengirim:</span>
                <span className="font-mono text-right">{transferData.senderName}</span>
              </div>
              <div className="flex justify-between">
                <span>Penerima:</span>
                <span className="font-mono text-right">{transferData.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span>Bank Tujuan:</span>
                <span className="font-mono">{transferData.receiverBank}</span>
              </div>
              {transferData.receiverAccount && (
                <div className="flex justify-between">
                  <span>No. Rekening:</span>
                  <span className="font-mono">{transferData.receiverAccount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>No. Ref:</span>
                <span className="font-mono">{transferData.referenceNumber}</span>
              </div>
            </div>

            <hr className="my-3 border-dashed" />

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Jumlah:</span>
                <span className="font-mono">Rp {formatNumber(transferData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Admin:</span>
                <span className="font-mono">Rp {formatNumber(transferData.adminFee)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>TOTAL:</span>
                <span className="font-mono">Rp {formatNumber(totalAmount)}</span>
              </div>
            </div>

            <hr className="my-3 border-dashed" />

            <div className="text-center text-xs text-gray-600 space-y-1">
              <p>Terima kasih telah menggunakan</p>
              <p className="font-semibold">JASA HRY</p>
              <p>Simpan bukti ini sebagai referensi</p>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Dicetak: {currentDateTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Cara Cetak:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Pastikan printer bluetooth sudah tersambung</li>
          <li>• Pilih ukuran kertas {transferData.paperSize} di pengaturan printer</li>
          <li>• Untuk hasil bagus, pakai kertas thermal</li>
          <li>• Simpan struk ini untuk arsip pelanggan</li>
        </ul>
      </div>
    </div>
  );
}
