import React, { useState, useEffect, useRef } from 'react';
import { Printer, Download, CheckCircle, Share2, ChevronDown, Copy, MessageCircle } from 'lucide-react';
import { TransferData } from '../types/TransferData';
import { uploadReceiptToCloudinary, generateFileName } from '../utils/cloudinaryUpload';
import { autoSaveAccountMapping } from '../utils/realOCR';

interface ReceiptPreviewProps {
  transferData: TransferData;
}

export default function ReceiptPreview({ transferData }: ReceiptPreviewProps) {
  const [autoSaveMessage, setAutoSaveMessage] = useState<string>('');
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  // Helper function untuk menampilkan notifikasi auto-save
  const showAutoSaveNotification = (name: string, account: string) => {
    setAutoSaveMessage(`✅ Mapping tersimpan: ${name} → ${account}`);
    setTimeout(() => setAutoSaveMessage(''), 3000); // Hilang setelah 3 detik
  };

  const formatReferenceNumber = (refNumber: string) => {
    // Untuk kertas 58mm, gunakan chunk yang lebih kecil
    // Untuk kertas 80mm, gunakan chunk yang optimal untuk nomor referensi panjang
    let maxLength;
    if (transferData.paperSize === '58mm') {
      maxLength = 15;
    } else {
      // Untuk 80mm: jika nomor ref sangat panjang (>30), gunakan chunk 19 untuk pembagian yang seimbang
      // 37 digit -> 19 + 18 (lebih seimbang daripada 25 + 12)
      maxLength = refNumber.length > 30 ? 19 : 25;
    }

    if (refNumber.length > maxLength) {
      const chunks = [];
      for (let i = 0; i < refNumber.length; i += maxLength) {
        chunks.push(refNumber.slice(i, i + maxLength));
      }
      return chunks;
    }
    return [refNumber];
  };

  const canFitInOneLine = (refNumber: string) => {
    // Untuk nomor referensi panjang (>30 digit), selalu gunakan multi-baris
    // untuk memastikan tidak terpotong
    if (refNumber.length > 30) {
      return false;
    }

    // Hitung sisa space setelah "No. Ref: " untuk layout horizontal
    // "No. Ref: " = 9 karakter
    const totalWidth = transferData.paperSize === '58mm' ? 32 : 50;
    const labelWidth = 9; // "No. Ref: "
    const availableWidth = totalWidth - labelWidth;
    return refNumber.length <= availableWidth;
  };



  const totalAmount = transferData.amount + transferData.adminFee;
  const currentDateTime = new Date().toLocaleString('id-ID');

  const handlePrint = () => {
    try {
      // Auto-save mapping sebelum print
      if (transferData.receiverName && transferData.receiverAccount) {
        const saved = autoSaveAccountMapping(transferData.receiverName, transferData.receiverAccount);
        if (saved) {
          console.log('💾 Auto-saved mapping before print:', {
            name: transferData.receiverName,
            account: transferData.receiverAccount
          });
          showAutoSaveNotification(transferData.receiverName, transferData.receiverAccount);
        }
      }

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
      // Auto-save mapping sebelum download PDF
      if (transferData.receiverName && transferData.receiverAccount) {
        const saved = autoSaveAccountMapping(transferData.receiverName, transferData.receiverAccount);
        if (saved) {
          console.log('💾 Auto-saved mapping before PDF download:', {
            name: transferData.receiverName,
            account: transferData.receiverAccount
          });
          showAutoSaveNotification(transferData.receiverName, transferData.receiverAccount);
        }
      }

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
      // Auto-save mapping sebelum share WhatsApp
      if (transferData.receiverName && transferData.receiverAccount) {
        const saved = autoSaveAccountMapping(transferData.receiverName, transferData.receiverAccount);
        if (saved) {
          console.log('💾 Auto-saved mapping before WhatsApp share:', {
            name: transferData.receiverName,
            account: transferData.receiverAccount
          });
          showAutoSaveNotification(transferData.receiverName, transferData.receiverAccount);
        }
      }

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
          
          // Try Web Share API first (gives user choice of apps)
          if (navigator.share && navigator.canShare && navigator.canShare({ text: message })) {
            try {
              await navigator.share({
                title: 'Bukti Transfer - Jasa HRY',
                text: message
              });
              console.log('✅ Shared via Web Share API');
              return;
            } catch (shareError) {
              if (shareError.name !== 'AbortError') {
                console.log('📱 Web Share failed, fallback to WhatsApp URL');
              } else {
                console.log('📱 Web Share cancelled by user');
                return; // User cancelled, don't open WhatsApp
              }
            }
          }

          // Show choice dialog for multiple WhatsApp apps
          const userChoice = confirm(
            '📱 Pilih cara share:\n\n' +
            '✅ OK = Buka WhatsApp langsung\n' +
            '❌ Cancel = Copy link untuk share manual'
          );

          if (userChoice) {
            // Open WhatsApp (will use system default)
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          } else {
            // Copy to clipboard for manual sharing
            try {
              await navigator.clipboard.writeText(message);
              alert('📋 Pesan berhasil dicopy ke clipboard!\n\nSekarang buka WhatsApp yang diinginkan dan paste pesan.');
            } catch (clipboardError) {
              // Fallback: show message in alert for manual copy
              alert('📝 Copy pesan ini ke WhatsApp:\n\n' + message);
            }
          }
          
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

  const handleCopyMessage = async () => {
    try {
      // Auto-save mapping sebelum copy
      if (transferData.receiverName && transferData.receiverAccount) {
        const saved = autoSaveAccountMapping(transferData.receiverName, transferData.receiverAccount);
        if (saved) {
          showAutoSaveNotification(transferData.receiverName, transferData.receiverAccount);
        }
      }

      // Create message without image URL (for manual sharing)
      const message = `📄 *BUKTI TRANSFER - JASA HRY*\n\n` +
        `✅ Transfer berhasil!\n` +
        `💰 Jumlah: Rp ${formatNumber(transferData.amount)}\n` +
        `👤 Dari: ${transferData.senderName}\n` +
        `👤 Ke: ${transferData.receiverName}\n` +
        `🏦 Bank: ${transferData.receiverBank}\n` +
        `📅 Tanggal: ${transferData.date}\n\n` +
        `Terima kasih telah menggunakan JASA HRY! 🙏`;

      await navigator.clipboard.writeText(message);
      alert('📋 Pesan berhasil dicopy!\n\nSekarang buka WhatsApp yang diinginkan dan paste pesan.');
      setShowShareDropdown(false);

    } catch (error) {
      console.error('❌ Copy failed:', error);
      alert('❌ Gagal copy pesan. Coba lagi.');
    }
  };

  const receiptWidth = transferData.paperSize === '58mm' ? 'w-48' : 'w-64';

  return (
    <div className="space-y-6">
      {/* Auto-save notification */}
      {autoSaveMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {autoSaveMessage}
        </div>
      )}

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
        {/* Share Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex">
            <button
              onClick={handleShareWhatsApp}
              data-share-button
              className="flex items-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-l-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share WhatsApp
            </button>
            <button
              onClick={() => setShowShareDropdown(!showShareDropdown)}
              className="px-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-r-lg border-l border-green-400 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Dropdown Menu */}
          {showShareDropdown && (
            <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg"
              >
                <MessageCircle className="w-4 h-4 mr-3 text-green-500" />
                <div>
                  <div className="font-medium">Share dengan Gambar</div>
                  <div className="text-xs text-gray-500">Buka WhatsApp default</div>
                </div>
              </button>
              <button
                onClick={handleCopyMessage}
                className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg border-t border-gray-100"
              >
                <Copy className="w-4 h-4 mr-3 text-blue-500" />
                <div>
                  <div className="font-medium">Copy Pesan</div>
                  <div className="text-xs text-gray-500">Pilih WhatsApp manual</div>
                </div>
              </button>
            </div>
          )}
        </div>
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
                  <span className="font-mono text-right">{transferData.receiverAccount}</span>
                </div>
              )}
              {canFitInOneLine(transferData.referenceNumber) ? (
                // Layout horizontal untuk nomor referensi yang muat dalam 1 baris
                <div className="flex justify-between">
                  <span>No. Ref:</span>
                  <span className="font-mono text-right">{transferData.referenceNumber}</span>
                </div>
              ) : (
                // Layout untuk nomor referensi panjang - 2 baris rata kanan
                <div className="space-y-1">
                  <span>No. Ref:</span>
                  <div className="font-mono text-xs text-right leading-tight">
                    {formatReferenceNumber(transferData.referenceNumber).map((chunk, index) => (
                      <div key={index}>
                        {chunk}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
