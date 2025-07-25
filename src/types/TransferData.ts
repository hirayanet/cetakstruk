export interface TransferData {
  date: string;
  senderName: string;
  amount: number;
  referenceNumber: string;
  adminFee: number;
  paperSize: '58mm' | '80mm';
}