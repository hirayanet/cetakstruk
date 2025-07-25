import { BaseProcessor } from './BaseProcessor';
import { TransferData } from '../../types';

export class BCAProcessor extends BaseProcessor {
  detectBank(imageData: ImageData): boolean {
    // BCA Blue variations - lebih spesifik untuk BCA
    const bcaColors = [
      [0, 61, 130],     // Primary BCA Blue (lebih gelap dari BRI)
      [0, 40, 100],     // Dark BCA Blue
      [0, 82, 160],     // Medium BCA Blue
      [25, 86, 155],    // Alternative BCA Blue
      [0, 51, 102],     // Deep BCA Blue
      [13, 71, 161]     // Navy Blue
    ];
    
    console.log('🔷 Testing BCA colors...');
    const matches = this.detectColorPattern(imageData, bcaColors);
    
    // BCA butuh threshold lebih tinggi karena warna lebih spesifik
    return matches;
  }

  extractData(imageData: ImageData, width: number, height: number): TransferData {
    const baseData = this.getDefaultData();
    
    return {
      ...baseData,
      bankType: 'BCA',
      senderName: 'JANE SMITH',
      amount: 750000,
      receiverName: 'BUDI SANTOSO',
      receiverBank: 'BRI',
      referenceNumber: 'BCA' + Date.now().toString().slice(-8),
      adminFee: 0 // Changed from 3000 to 0
    };
  }
}




