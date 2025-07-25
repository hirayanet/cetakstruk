import React, { useCallback, useState } from 'react';
import { Upload, FileImage, Camera } from 'lucide-react';

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

  const processImage = (file: File) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      
      console.log('📤 Image processed, calling onImageUpload...');
      
      // Langsung panggil onImageUpload, biar OCR jalan di background
      setIsProcessing(false);
      onImageUpload(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  if (isProcessing) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sedang Membaca Foto...</h3>
          <p className="text-gray-600">Mengambil data dari struk transfer</p>
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
