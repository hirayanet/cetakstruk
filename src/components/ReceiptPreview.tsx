import React from 'react';
import { Printer, Download, CheckCircle } from 'lucide-react';
import { TransferData } from '../types/TransferData';

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
    window.print();
  };

  const handleDownloadPDF = () => {
    // Simulate PDF download
    const element = document.createElement('a');
    element.href = '#';
    element.download = `bukti-transfer-${transferData.referenceNumber}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const receiptWidth = transferData.paperSize === '58mm' ? 'w-48' : 'w-64';

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
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
      </div>

      {/* Receipt Preview */}
      <div className="flex justify-center">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden print:shadow-none print:rounded-none">
          <div className={`${receiptWidth} bg-white p-4 print:p-2 receipt-content`}>
            {/* Header */}
            <div className="text-center border-b border-gray-300 pb-3 mb-3">
              <h1 className="text-lg font-bold">JASA HRY</h1>
              <p className="text-xs text-gray-600">Kirim Uang & Pembayaran</p>
              <p className="text-xs text-gray-600">Cepat • Aman • Terpercaya</p>
            </div>

            {/* Success Icon */}
            <div className="text-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-semibold text-green-600">KIRIM UANG BERHASIL</p>
            </div>

            {/* Transfer Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span className="font-mono">{transferData.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span className="font-mono">{currentDateTime.split(' ')[1]}</span>
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
              <div className="flex justify-between">
                <span>No. Ref:</span>
                <span className="font-mono">{transferData.referenceNumber}</span>
              </div>
            </div>

            <hr className="my-3 border-dashed" />

            {/* Amount Details */}
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

            {/* Footer */}
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

      {/* Print Instructions */}
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
