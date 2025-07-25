import React from 'react';
import { BankType } from '../types/BankType';

interface BankSelectorProps {
  selectedBank: BankType;
  onBankChange: (bank: BankType) => void;
}

export default function BankSelector({ selectedBank, onBankChange }: BankSelectorProps) {
  const banks = [
    { type: 'BRI', name: 'Bank BRI', color: 'bg-blue-600' },
    { type: 'BCA', name: 'Bank BCA', color: 'bg-blue-800' },
    { type: 'MANDIRI', name: 'Bank Mandiri', color: 'bg-yellow-500' },
    { type: 'BNI', name: 'Bank BNI', color: 'bg-orange-500' },
    { type: 'SEABANK', name: 'SeaBank', color: 'bg-green-600' },
    { type: 'DANA', name: 'DANA', color: 'bg-blue-500' }
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Pilih Bank (jika deteksi otomatis salah)
      </label>
      <div className="grid grid-cols-3 gap-2">
        {banks.map((bank) => (
          <button
            key={bank.type}
            onClick={() => onBankChange(bank.type as BankType)}
            className={`p-2 rounded text-white text-xs ${bank.color} ${
              selectedBank === bank.type ? 'ring-2 ring-gray-800' : ''
            }`}
          >
            {bank.name}
          </button>
        ))}
      </div>
    </div>
  );
}