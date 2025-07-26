import React, { useState, useEffect } from 'react';
import { Upload, FileImage, Printer, Download, Calculator, CheckCircle, LogOut, Home } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import TransferForm from './components/TransferForm';
import ReceiptPreview from './components/ReceiptPreview';
import LoginForm from './components/LoginForm';
import { TransferData, BankType } from './types/TransferData';
import { extractDataFromImage } from './utils/ocrSimulator';
import { saveAuthData, loadAuthData, clearAuthData, saveAppState, loadAppState, clearAppState } from './utils/auth';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Application state
  const [step, setStep] = useState<'bank-select' | 'upload' | 'form' | 'preview'>('bank-select');
  const [selectedBank, setSelectedBank] = useState<BankType>('BCA');
  const [transferData, setTransferData] = useState<TransferData>({
    date: '',
    senderName: '',
    amount: 0,
    receiverName: '',
    receiverBank: '',
    referenceNumber: '',
    adminFee: 0, // Changed from 2500 to 0
    paperSize: '80mm',
    bankType: 'BCA'
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Load authentication state and app state from localStorage on app start
  useEffect(() => {
    const authData = loadAuthData();
    if (authData && authData.isAuthenticated && authData.currentUser) {
      setIsAuthenticated(true);
      setCurrentUser(authData.currentUser);

      // Load app state if user is authenticated
      const appState = loadAppState();
      if (appState) {
        setStep(appState.step);
        setSelectedBank(appState.selectedBank);
        setTransferData(appState.transferData);
        setUploadedImage(appState.uploadedImage);
      }
    }
    setIsInitializing(false);
  }, []);

  // Save authentication state to localStorage whenever it changes
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      saveAuthData({
        isAuthenticated,
        currentUser
      });
    }
  }, [isAuthenticated, currentUser, isInitializing]);

  // Save app state to localStorage whenever it changes (only if authenticated)
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      saveAppState({
        step,
        selectedBank,
        transferData,
        uploadedImage
      });
    }
  }, [step, selectedBank, transferData, uploadedImage, isAuthenticated, isInitializing]);

  // Authentication functions
  const handleLogin = async (username: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple authentication logic (in production, this should be done on the server)
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      setCurrentUser(username);
      setLoginError('');
    } else {
      setLoginError('Username atau password salah. Silakan coba lagi.');
    }

    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setStep('bank-select');
    setUploadedImage(null);
    setTransferData({
      date: '',
      senderName: '',
      amount: 0,
      receiverName: '',
      receiverBank: '',
      referenceNumber: '',
      adminFee: 0,
      paperSize: '58mm',
      bankType: 'BCA'
    });
    // Clear authentication data and app state from localStorage
    clearAuthData();
    clearAppState();
  };

  const handleBankSelect = (bank: BankType) => {
    setSelectedBank(bank);
    setTransferData(prev => ({ ...prev, bankType: bank }));
    setStep('upload');
  };

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setIsExtracting(true);
    
    console.log('🎯 Starting data extraction...');
    
    try {
      // Extract data with pre-selected bank and paper size
      const extractedData = await extractDataFromImage(imageUrl, selectedBank, transferData.paperSize);
      console.log('✅ Data extracted:', extractedData);
      setTransferData(extractedData);
      setStep('form');
    } catch (error) {
      console.error('❌ Extraction failed:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFormSubmit = (data: TransferData) => {
    setTransferData(data);
    setStep('preview');
  };

  const handleBack = () => {
    if (step === 'preview') setStep('form');
    if (step === 'form') setStep('upload');
    if (step === 'upload') setStep('bank-select');
  };

  const handleNewReceipt = () => {
    setStep('bank-select');
    setSelectedBank('BCA');
    setUploadedImage(null);
    setTransferData({
      date: '',
      senderName: '',
      amount: 0,
      receiverName: '',
      receiverBank: '',
      referenceNumber: '',
      adminFee: 0, // Changed from 2500 to 0
      paperSize: '58mm',
      bankType: 'BCA'
    });
    // Clear app state but keep authentication
    clearAppState();
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileImage className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Memuat Aplikasi...</h2>
          <p className="text-gray-600">Cetak Bukti Transfer - Jasa HRY</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginForm
        onLogin={handleLogin}
        isLoading={isLoggingIn}
        error={loginError}
      />
    );
  }

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
                <p className="text-sm text-gray-600">HRY - Sederhana, Cepat, Rapi!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* User info and actions */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Halo, <strong>{currentUser}</strong></span>
                {step !== 'bank-select' && (
                  <button
                    onClick={handleNewReceipt}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Kembali ke Home"
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
              {/* Progress indicators */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${step === 'upload' ? 'bg-blue-600' : 'bg-green-500'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 'form' ? 'bg-blue-600' : step === 'preview' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full ${step === 'preview' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === 'bank-select' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Bank</h2>
              <p className="text-gray-600">Pilih bank dari resi transfer yang akan diupload</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                { type: 'BCA', name: 'Bank BCA', color: 'bg-blue-800', icon: '🏦' },
                { type: 'BRI', name: 'Bank BRI', color: 'bg-blue-600', icon: '🏛️' },
                { type: 'MANDIRI', name: 'Bank Mandiri', color: 'bg-yellow-500', icon: '🏪' },
                { type: 'BNI', name: 'Bank BNI', color: 'bg-orange-500', icon: '🏢' },
                { type: 'SEABANK', name: 'SeaBank', color: 'bg-green-600', icon: '🌊' },
                { type: 'DANA', name: 'DANA', color: 'bg-blue-500', icon: '💳' }
              ].map((bank) => (
                <button
                  key={bank.type}
                  onClick={() => handleBankSelect(bank.type as BankType)}
                  className={`p-6 rounded-xl text-white ${bank.color} hover:opacity-90 transition-all transform hover:scale-105 shadow-lg`}
                >
                  <div className="text-3xl mb-2">{bank.icon}</div>
                  <div className="font-semibold">{bank.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Resi {selectedBank}</h2>
                <p className="text-gray-600">Upload foto struk transfer dari {selectedBank}</p>
              </div>
              <button
                onClick={handleBack}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Ganti Bank
              </button>
            </div>
            <ImageUploader onImageUpload={handleImageUpload} selectedBank={selectedBank} />
          </div>
        )}

        {step === 'form' && (
          <div className="space-y-6">
            {isExtracting ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Mengekstrak Data dengan OCR...</h3>
                <p className="text-gray-600 text-sm">Sedang membaca teks dari resi {selectedBank}</p>
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p>🔍 Loading Tesseract.js...</p>
                  <p>📖 Membaca teks dari gambar...</p>
                  <p>🏦 Parsing format {selectedBank}...</p>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
