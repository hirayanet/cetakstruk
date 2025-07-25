import React, { useState } from 'react';
import { Upload, FileImage, Printer, Download, Calculator, CheckCircle } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import TransferForm from './components/TransferForm';
import ReceiptPreview from './components/ReceiptPreview';
import { TransferData } from './types/TransferData';
import { extractDataFromImage } from './utils/ocrSimulator';

function App() {
  const [step, setStep] = useState<'upload' | 'form' | 'preview'>('upload');
  const [transferData, setTransferData] = useState<TransferData>({
    date: '',
    senderName: '',
    amount: 0,
    referenceNumber: '',
    adminFee: 2500,
    paperSize: '58mm'
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    
    // Extract data from the uploaded image
    const extractedData = await extractDataFromImage(imageUrl);
    setTransferData(extractedData);
    setStep('form');
  };

  const handleFormSubmit = (data: TransferData) => {
    setTransferData(data);
    setStep('preview');
  };

  const handleBack = () => {
    if (step === 'preview') setStep('form');
    if (step === 'form') setStep('upload');
  };

  const handleNewReceipt = () => {
    setStep('upload');
    setUploadedImage(null);
    setTransferData({
      date: '',
      senderName: '',
      amount: 0,
      referenceNumber: '',
      adminFee: 2500,
      paperSize: '58mm'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <FileImage className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cetak Bukti Transfer</h1>
                <p className="text-sm text-gray-600">Jasa HRY - Sederhana, Cepat, Rapi!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${step === 'upload' ? 'bg-blue-600' : 'bg-green-500'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step === 'form' ? 'bg-blue-600' : step === 'preview' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-3 h-3 rounded-full ${step === 'preview' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unggah Bukti Transfer</h2>
              <p className="text-gray-600">Unggah foto struk transfer bank untuk membaca data secara otomatis</p>
            </div>
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Periksa Data Transfer</h2>
                <p className="text-gray-600">Cek dan ubah data yang sudah dibaca dari foto</p>
              </div>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Kembali
              </button>
            </div>
            <TransferForm
              initialData={transferData}
              uploadedImage={uploadedImage}
              onSubmit={handleFormSubmit}
            />
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lihat & Cetak</h2>
                <p className="text-gray-600">Siap dicetak atau disimpan sebagai PDF</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Ubah
                </button>
                <button
                  onClick={handleNewReceipt}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  Buat Baru
                </button>
              </div>
            </div>
            <ReceiptPreview transferData={transferData} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 Jasa HRY. Solusi cetak struk transfer yang mudah dan cepat.</p>
            <p className="mt-1">Cocok untuk agen BRILink, jasa kirim uang harian, dan usaha keuangan kecil.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;