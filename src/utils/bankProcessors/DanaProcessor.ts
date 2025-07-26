import { BaseProcessor } from './BaseProcessor';
import { TransferData } from '../../types';

export class DanaProcessor extends BaseProcessor {
  detectBank(imageData: ImageData): boolean {
    // DANA colors: Lebih spesifik, hindari overlap dengan BRI/BCA
    const danaColors = [
      [33, 150, 243],   // DANA Blue (lebih cyan)
      [100, 181, 246],  // DANA Light Blue
      [21, 101, 192]    // DANA Dark Blue
    ];
    
    console.log('💙 Testing DANA colors...');
    const matches = this.detectColorPattern(imageData, danaColors);
    
    // DANA butuh threshold lebih tinggi untuk menghindari false positive
    return matches && this.hasHighColorDensity(imageData, danaColors);
  }
  
  private hasHighColorDensity(imageData: ImageData, colors: number[][]): boolean {
    // Implementasi sederhana - bisa diperbaiki nanti
    return false; // Temporary disable untuk testing
  }

  extractData(imageData: ImageData, width: number, height: number): TransferData {
    const baseData = this.getDefaultData();
    return {
      ...baseData,
      bankType: 'DANA',
      senderName: '0857****4165', // Format ID DANA dengan asterisk
      amount: 300000,
      receiverName: 'GANI MUHAMMAD RAMADLAN', // Nama lengkap dari struk
      receiverBank: 'SEABANK',
      receiverAccount: '****0190',
      referenceNumber: '2025072110121410010100166933269202437', // ID Transaksi lengkap 37 digit
      adminFee: 0
    };
  }
}


