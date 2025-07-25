import { BaseProcessor } from './BaseProcessor';
import { TransferData } from '../../types';

export class BNIProcessor extends BaseProcessor {
  detectBank(imageData: ImageData): boolean {
    const bniColors = [[255, 102, 0], [255, 140, 0]]; // Orange
    return this.detectColorPattern(imageData, bniColors);
  }

  extractData(imageData: ImageData, width: number, height: number): TransferData {
    const baseData = this.getDefaultData();
    return {
      ...baseData,
      bankType: 'BNI',
      senderName: 'SITI NURHALIZA',
      amount: 300000,
      referenceNumber: 'BNI' + Date.now().toString().slice(-8),
      adminFee: 0 // Changed from 2500 to 0
    };
  }
}
