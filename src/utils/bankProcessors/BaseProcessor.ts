import { BankType, TransferData } from '../../types';

export abstract class BaseProcessor {
  abstract detectBank(imageData: ImageData): boolean;
  abstract extractData(imageData: ImageData, width: number, height: number): TransferData;

  protected getDefaultData(): TransferData {
    return {
      date: new Date().toLocaleDateString('id-ID'),
      senderName: '',
      amount: 0,
      receiverName: '',
      receiverBank: '',
      referenceNumber: '',
      adminFee: 0, // Changed from 2500 to 0
      paperSize: '58mm',
      bankType: 'UNKNOWN'
    };
  }

  protected detectColorPattern(imageData: ImageData, targetColors: number[][]): boolean {
    const data = imageData.data;
    let matches = 0;
    let strongMatches = 0; // Exact matches
    const totalPixels = data.length / 4;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      for (const color of targetColors) {
        const rDiff = Math.abs(r - color[0]);
        const gDiff = Math.abs(g - color[1]);
        const bDiff = Math.abs(b - color[2]);
        
        if (rDiff < 30 && gDiff < 30 && bDiff < 30) {
          matches++;
          
          // Strong match (closer colors)
          if (rDiff < 15 && gDiff < 15 && bDiff < 15) {
            strongMatches++;
          }
        }
      }
    }
    
    const matchPercentage = (matches / totalPixels) * 100;
    const strongMatchPercentage = (strongMatches / totalPixels) * 100;
    
    console.log(`🎨 Color Analysis:`, {
      targetColors,
      matches,
      strongMatches,
      matchPercentage: matchPercentage.toFixed(3) + '%',
      strongMatchPercentage: strongMatchPercentage.toFixed(3) + '%',
      threshold: matches > 100,
      confidence: Math.min(strongMatchPercentage * 20, 100).toFixed(1) + '%'
    });
    
    // Prioritas strong matches untuk akurasi lebih baik
    return matches > 100 && strongMatches > 50;
  }
}




