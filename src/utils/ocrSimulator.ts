import { TransferData, BankType } from '../types/TransferData';
import { extractDataWithRealOCR } from './realOCR';

// PASTIKAN INI TRUE untuk real OCR
const USE_REAL_OCR = true;

export async function extractDataFromImage(imageUrl: string, bankType: BankType, paperSize: '58mm' | '80mm' = '80mm'): Promise<TransferData> {
  console.log('🎯 OCR Mode:', USE_REAL_OCR ? 'REAL OCR' : 'SIMULATOR');
  console.log('📏 Paper Size:', paperSize);

  if (USE_REAL_OCR) {
    console.log('🚀 Using REAL OCR with Tesseract');
    try {
      return await extractDataWithRealOCR(imageUrl, bankType, paperSize);
    } catch (error) {
      console.error('❌ Real OCR failed, fallback to simulator:', error);
      return simulateOCR(imageUrl, bankType, paperSize);
    }
  }

  console.log('🎭 Using OCR Simulator');
  return simulateOCR(imageUrl, bankType, paperSize);
}

async function simulateOCR(imageUrl: string, bankType: BankType, paperSize: '58mm' | '80mm' = '80mm'): Promise<TransferData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateRealisticData(bankType, imageUrl, paperSize));
    }, 2000);
  });
}

function generateRealisticData(bankType: BankType, imageUrl: string, paperSize: '58mm' | '80mm' = '80mm'): TransferData {
  return {
    date: new Date().toLocaleDateString('id-ID'),
    senderName: 'SIMULATED SENDER',
    amount: 750000,
    receiverName: 'SIMULATED RECEIVER',
    receiverBank: 'BRI',
    referenceNumber: bankType + Date.now().toString().slice(-8),
    adminFee: 2500,
    paperSize,
    bankType
  };
}
