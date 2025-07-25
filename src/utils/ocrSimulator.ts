import { TransferData } from '../types/TransferData';

// Simulate OCR extraction by analyzing image characteristics
export async function extractDataFromImage(imageUrl: string): Promise<TransferData> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas to analyze image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(getDefaultData());
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Analyze image characteristics to generate realistic data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const extractedData = analyzeImageData(imageData, img.width, img.height);
      
      resolve(extractedData);
    };
    
    img.onerror = () => {
      resolve(getDefaultData());
    };
    
    img.src = imageUrl;
  });
}

function analyzeImageData(imageData: ImageData, width: number, height: number): TransferData {
  const data = imageData.data;
  let totalBrightness = 0;
  let colorVariance = 0;
  
  // Analyze image characteristics
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;
    colorVariance += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
  }
  
  const avgBrightness = totalBrightness / (data.length / 4);
  const avgColorVariance = colorVariance / (data.length / 4);
  
  // Generate data based on image characteristics
  const imageHash = generateImageHash(avgBrightness, avgColorVariance, width, height);
  
  return generateRealisticData(imageHash);
}

function generateImageHash(brightness: number, variance: number, width: number, height: number): number {
  return Math.floor((brightness * variance * width * height) % 1000000);
}

function generateRealisticData(seed: number): TransferData {
  // Use seed to generate consistent but varied data
  const random = (min: number, max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return min + (seed / 233280) * (max - min);
  };
  
  // Generate realistic transfer amounts (common amounts in Indonesia)
  const commonAmounts = [
    50000, 75000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000,
    500000, 600000, 750000, 800000, 900000, 1000000, 1200000, 1500000, 2000000
  ];
  
  const amount = commonAmounts[Math.floor(random(0, commonAmounts.length))];
  
  // Generate realistic Indonesian names
  const firstNames = [
    'AHMAD', 'BUDI', 'SARI', 'DEWI', 'ANDI', 'RINI', 'JOKO', 'MAYA', 'AGUS', 'LINA',
    'DEDI', 'WATI', 'HADI', 'SITI', 'RIAN', 'INDRA', 'FITRI', 'BAYU', 'RATNA', 'DIAN'
  ];
  
  const lastNames = [
    'PRATAMA', 'SARI', 'WIJAYA', 'UTAMA', 'SANTOSO', 'PERMATA', 'KUSUMA', 'HANDOKO',
    'SETIAWAN', 'MAHARANI', 'PURNAMA', 'LESTARI', 'NUGROHO', 'SAFITRI', 'WIBOWO'
  ];
  
  const firstName = firstNames[Math.floor(random(0, firstNames.length))];
  const lastName = lastNames[Math.floor(random(0, lastNames.length))];
  const senderName = `${firstName} ${lastName}`;
  
  // Generate date (recent dates)
  const today = new Date();
  const daysBack = Math.floor(random(0, 7)); // Last 7 days
  const transferDate = new Date(today.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  const date = transferDate.toLocaleDateString('id-ID');
  
  // Generate reference number
  const bankCodes = ['TF', 'TR', 'BT', 'MB', 'IB'];
  const bankCode = bankCodes[Math.floor(random(0, bankCodes.length))];
  const refNumber = bankCode + Math.floor(random(10000000, 99999999)).toString();
  
  // Vary admin fee based on amount
  let adminFee = 2500;
  if (amount >= 1000000) adminFee = 5000;
  else if (amount >= 500000) adminFee = 3500;
  else if (amount >= 200000) adminFee = 2500;
  else adminFee = 2000;
  
  return {
    date,
    senderName,
    amount,
    referenceNumber: refNumber,
    adminFee,
    paperSize: '58mm'
  };
}

function getDefaultData(): TransferData {
  return {
    date: new Date().toLocaleDateString('id-ID'),
    senderName: 'NAMA PENGIRIM',
    amount: 0,
    referenceNumber: 'TF00000000',
    adminFee: 2500,
    paperSize: '58mm'
  };
}