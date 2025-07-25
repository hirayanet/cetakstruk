import { BankType, TransferData } from '../../types';
import { BRIProcessor } from './BRIProcessor';
import { BCAProcessor } from './BCAProcessor';
import { MandiriProcessor } from './MandiriProcessor';
import { BNIProcessor } from './BNIProcessor';
import { SeabankProcessor } from './SeabankProcessor';
import { DanaProcessor } from './DanaProcessor';
import { DefaultProcessor } from './DefaultProcessor';

export interface BankProcessor {
  detectBank(imageData: ImageData): boolean;
  extractData(imageData: ImageData, width: number, height: number): TransferData;
}

export const bankProcessors: Record<BankType, BankProcessor> = {
  BRI: new BRIProcessor(),
  BCA: new BCAProcessor(),
  MANDIRI: new MandiriProcessor(),
  BNI: new BNIProcessor(),
  SEABANK: new SeabankProcessor(),
  DANA: new DanaProcessor(),
  UNKNOWN: new DefaultProcessor()
};

