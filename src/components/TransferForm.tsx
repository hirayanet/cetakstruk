import React, { useState } from 'react';
import { Calculator, CreditCard, Calendar, User, Hash } from 'lucide-react';
import { TransferData } from '../types/TransferData';

interface TransferFormProps {
  initialData: TransferData;
  uploadedImage: string | null;
  onSubmit: (data: TransferData) => void;
}

export default function TransferForm({ initialData, uploadedImage, onSubmit }: TransferFormProps) {
  const [formData, setFormData] = useState<TransferData>(initialData);

  const adminFeeOptions = [
    { value: 1000, label: 'Rp 1.000' },
    { value: 1500, label: 'Rp 1.500' },
    { value: 2000, label: 'Rp 2.000' },
    { value: 2500, label: 'Rp 2.500' },
    { value: 3000, label: 'Rp 3.000' },
    { value: 3500, label: 'Rp 3.500' },
    { value: 4000, label: 'Rp 4.000' },
    { value: 5000, label: 'Rp 5.000' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const totalAmount = formData.amount + formData.adminFee;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              Tanggal Kirim
            </label>
            <input
              type="text"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="DD/MM/YYYY"
              required
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 mr-2" />
              Nama Pengirim
            </label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="NAMA LENGKAP"
              required
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 mr-2" />
              Jumlah Uang
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="500000"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Rp {formatNumber(formData.amount)}
            </p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 mr-2" />
              Nomor Resi
            </label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="TF12345678"
              required
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Calculator className="w-4 h-4 mr-2" />
              Biaya Admin
            </label>
            <select
              value={formData.adminFee}
              onChange={(e) => setFormData({ ...formData, adminFee: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {adminFeeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Ukuran Kertas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="58mm"
                  checked={formData.paperSize === '58mm'}
                  onChange={(e) => setFormData({ ...formData, paperSize: e.target.value as '58mm' | '80mm' })}
                  className="mr-2"
                />
                58mm
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="80mm"
                  checked={formData.paperSize === '80mm'}
                  onChange={(e) => setFormData({ ...formData, paperSize: e.target.value as '58mm' | '80mm' })}
                  className="mr-2"
                />
                80mm
              </label>
            </div>
          </div>

          {/* Total Calculation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Jumlah Kirim:</span>
                <span>Rp {formatNumber(formData.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Biaya Admin:</span>
                <span>Rp {formatNumber(formData.adminFee)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-green-600">Rp {formatNumber(totalAmount)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Lanjut ke Tampilan
          </button>
        </form>
      </div>

      {/* Image Preview */}
      {uploadedImage && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Foto yang Diunggah</h3>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Data Terbaca:</strong> Sistem sudah membaca foto dan mengambil informasi transfer. 
              Silakan cek dan ubah data di sebelah kiri jika perlu.
            </p>
          </div>
          <img
            src={uploadedImage}
            alt="Foto struk yang diunggah"
            className="w-full h-auto rounded-lg border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}