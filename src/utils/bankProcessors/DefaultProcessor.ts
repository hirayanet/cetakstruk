import { BaseProcessor } from './BaseProcessor';
import { TransferData } from '../../types';

export class DefaultProcessor extends BaseProcessor {
  detectBank(imageData: ImageData): boolean {
    return true; // Always matches as fallback
  }

  extractData(imageData: ImageData, width: number, height: number): TransferData {
    return this.getDefaultData();
  }
}