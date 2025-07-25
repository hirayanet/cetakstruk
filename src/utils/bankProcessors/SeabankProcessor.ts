import { BaseProcessor } from './BaseProcessor';
import { TransferData } from '../../types';

export class SeabankProcessor extends BaseProcessor {
  detectBank(imageData: ImageData): boolean {
    const seabankColors = [[0, 150, 136], [76, 175, 80]]; // Teal/Green
    return this.detectColorPattern(imageData, seabankColors);
  }

  extractData(imageData: ImageData, width: number, height: number): TransferData {
    const baseData = this.getDefaultData();
    return {
      ...baseData,
      bankType: 'SEABANK',
      senderName: 'AHMAD RIZKI',
      amount: 250000,
      receiverAccount: '901234567890', // Tambahkan default nomor rekening Seabank
      referenceNumber: 'SEA' + Date.now().toString().slice(-8),
      adminFee: 0
    };
  }
}

