export type BankType = 'BRI' | 'BCA' | 'MANDIRI' | 'BNI' | 'SEABANK' | 'DANA' | 'UNKNOWN';

export interface BankConfig {
  name: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
  };
  receiptFormat: {
    dateFormat: string;
    amountPosition: string;
    referencePattern: RegExp;
  };
}