import { TransferData, BankType } from '../types/TransferData';
import { extractDataWithRealOCR } from './realOCR';

// PASTIKAN INI TRUE untuk real OCR
const USE_REAL_OCR = true;

export async function extractDataFromImage(imageUrl: string, bankType: BankType): Promise<TransferData> {
  console.log('🎯 OCR Mode:', USE_REAL_OCR ? 'REAL OCR' : 'SIMULATOR');
  
  if (USE_REAL_OCR) {
    console.log('🚀 Using REAL OCR with Tesseract');
    try {
      return await extractDataWithRealOCR(imageUrl, bankType);
    } catch (error) {
      console.error('❌ Real OCR failed, fallback to simulator:', error);
      return simulateOCR(imageUrl, bankType);
    }
  }
  
  console.log('🎭 Using OCR Simulator');
  return simulateOCR(imageUrl, bankType);
}

async function simulateOCR(imageUrl: string, bankType: BankType): Promise<TransferData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateRealisticData(bankType, imageUrl));
    }, 2000);
  });
}

function generateRealisticData(bankType: BankType, imageUrl: string): TransferData {
  return {
    date: new Date().toLocaleDateString('id-ID'),
    senderName: 'SIMULATED SENDER',
    amount: 750000,
    receiverName: 'SIMULATED RECEIVER',
    receiverBank: 'BRI',
    referenceNumber: bankType + Date.now().toString().slice(-8),
    adminFee: 2500,
    paperSize: '58mm',
    bankType
  };
}
