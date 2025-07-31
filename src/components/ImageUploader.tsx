import React, { useCallback, useState } from 'react';
import { Upload, FileImage, Camera } from 'lucide-react';
import { BankType } from '../types/TransferData';
import { compressImage } from '../utils/imageCompress';

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  selectedBank?: BankType;
}

export default function ImageUploader({ onImageUpload, selectedBank }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      processImage(imageFile);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  }, []);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    const t0 = performance.now();
    let fileToUse = file;
    let compressed = false;
    // Hanya compress jika file > 1MB atau resolusi besar
    if (file.size > 1_000_000) {
      try {
        const blob = await compressImage(file, { maxWidth: 1024, maxHeight: 1024, quality: 0.8 });
        console.log('[COMPRESS] Asli:', file.size/1024, 'KB → Hasil:', blob.size/1024, 'KB');
        fileToUse = new File([blob], file.name, { type: blob.type });
        compressed = true;
      } catch (e) {
        console.warn('[COMPRESS] Gagal compress, pakai file asli', e);
      }
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      const t1 = performance.now();
      console.log('📤 Image processed, calling onImageUpload...');
      if (compressed) {
        console.log(`[COMPRESS][PROFILING] Waktu compress + encode: ${(t1-t0).toFixed(1)}ms`);
      }
      // Small delay to show upload processing
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsProcessing(false);
      onImageUpload(imageUrl);
    };
    reader.readAsDataURL(fileToUse);
  };


  if (isProcessing) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Berhasil!</h3>
          <p className="text-gray-600 mb-4">Foto sedang diproses...</p>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Mempersiapkan untuk ekstraksi data</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {selectedBank && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏦</span>
            <div>
              <p className="font-semibold text-blue-900">Bank Terpilih: {selectedBank}</p>
              <p className="text-sm text-blue-600">Pastikan resi yang diupload dari bank ini</p>
            </div>
          </div>
        </div>
      )}

      {/* Tips untuk foto berkualitas */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
          <span className="text-lg mr-2">💡</span>
          Tips Foto Terbaik untuk Akurasi Maksimal
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-green-800">
              <span className="mr-2">✅</span>
              <span>Pencahayaan cukup terang</span>
            </div>
            <div className="flex items-center text-green-800">
              <span className="mr-2">✅</span>
              <span>Foto tegak lurus (tidak miring)</span>
            </div>
            <div className="flex items-center text-green-800">
              <span className="mr-2">✅</span>
              <span>Jarak 15-20cm dari struk</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-red-600">
              <span className="mr-2">❌</span>
              <span>Hindari bayangan atau pantulan</span>
            </div>
            <div className="flex items-center text-red-600">
              <span className="mr-2">❌</span>
              <span>Jangan terlalu dekat/jauh</span>
            </div>
            <div className="flex items-center text-red-600">
              <span className="mr-2">❌</span>
              <span>Hindari foto blur atau goyang</span>
            </div>
          </div>
        </div>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unggah Struk Transfer
        </h3>
        <p className="text-gray-600 mb-6">
          Seret foto struk ke sini atau klik untuk pilih file
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <label className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
            <FileImage className="w-5 h-5 mr-2" />
            Pilih Foto
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
          
          <label className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors">
            <Camera className="w-5 h-5 mr-2" />
            Ambil Foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Format: JPG, PNG, WebP (Maksimal 10MB)
        </p>
      </div>
    </div>
  );
}
