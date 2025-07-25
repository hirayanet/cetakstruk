import { BaseProcessor } from './BaseProcessor';
import { TransferData } from '../../types';

export class BRIProcessor extends BaseProcessor {
  detectBank(imageData: ImageData): boolean {
    // BRI Blue variations - bedakan dari BCA
    const briColors = [
      [0, 102, 204],    // Primary BRI Blue (lebih terang dari BCA)
      [51, 153, 255],   // Light BRI Blue
      [0, 76, 153],     // Medium BRI Blue
      [25, 118, 210],   // Alternative Blue
      [30, 144, 255]    // Dodger Blue (khas BRI)
    ];
    
    console.log('🔵 Testing BRI colors...');
    return this.detectColorPattern(imageData, briColors);
  }

  extractData(imageData: ImageData, width: number, height: number): TransferData {
    const baseData = this.getDefaultData();
    
    return {
      ...baseData,
      bankType: 'BRI',
      senderName: 'JOHN DOE',
      amount: 500000,
      receiverAccount: '6603 0103 5831 539',
      referenceNumber: 'BRI' + Date.now().toString().slice(-8),
      adminFee: 0
    };
  }
}





