import { BaseProcessor } from './BaseProcessor';
import { TransferData } from '../../types';

export class MandiriProcessor extends BaseProcessor {
  detectBank(imageData: ImageData): boolean {
    // Mandiri colors: Yellow/Orange (#FFB81C)
    const mandiriColors = [[255, 184, 28], [255, 165, 0]];
    return this.detectColorPattern(imageData, mandiriColors);
  }

  extractData(imageData: ImageData, width: number, height: number): TransferData {
    const baseData = this.getDefaultData();
    
    return {
      ...baseData,
      bankType: 'MANDIRI',
      senderName: 'BUDI SANTOSO',
      amount: 1000000,
      referenceNumber: 'MDR' + Date.now().toString().slice(-8),
      adminFee: 0 // Changed from 2500 to 0
    };
  }
}
