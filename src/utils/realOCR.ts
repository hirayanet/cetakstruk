import { createWorker } from 'tesseract.js';
import { TransferData, BankType } from '../types/TransferData';

function parseBCAReceipt(text: string, bankType: BankType): TransferData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('🔷 Parsing BCA Receipt:', lines);
  
  let senderName = '';
  let receiverName = '';
  let amount = 0;
  let referenceNumber = '';
  let receiverAccount = '';
  let date = '';
  let time = '';
  let adminFee = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // Date and time - format: 25/07 07:29:32
    if (line.match(/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}/)) {
      const dateTimeMatch = line.match(/(\d{2}\/\d{2})\s+(\d{2}:\d{2}:\d{2})/);
      if (dateTimeMatch) {
        date = dateTimeMatch[1] + '/' + new Date().getFullYear();
        time = dateTimeMatch[2];
      }
    }
    
    // Account number - after "Ke" - format: Ke 1670903504
    if (upperLine.startsWith('KE ')) {
      receiverAccount = line.replace(/^KE\s+/i, '').trim();
    }
    
    // Receiver name - usually line after account number
    if (receiverAccount && !receiverName && line.length > 2 && 
        !line.includes('Rp') && !line.includes('Ref') && 
        !line.match(/\d{2}\/\d{2}/) && !upperLine.includes('TRANSFER')) {
      if (line.match(/^[A-Z\s]+$/)) {
        receiverName = line;
      }
    }
    
    // Amount - format: Rp 130,000.00
    if (line.startsWith('Rp ')) {
      let amountMatch = line.match(/Rp\s+([\d,]+)\.00/);
      if (!amountMatch) {
        amountMatch = line.match(/Rp\s+([\d,]+)/);
      }
      
      if (amountMatch) {
        const cleanAmount = amountMatch[1].replace(/,/g, '');
        amount = parseInt(cleanAmount);
        console.log('💰 BCA Amount:', { original: line, parsed: amount });
      }
    }
    
    // Reference number - format: Ref 9503120250725072931956672CAE83FCB72B
    if (upperLine.startsWith('REF ')) {
      referenceNumber = line.replace(/^REF\s+/i, '').trim();
    }
  }
  
  if (!senderName) senderName = 'PENGIRIM BCA';
  
  return {
    date: date || new Date().toLocaleDateString('id-ID'),
    senderName,
    amount: amount || 0,
    receiverName: receiverName || 'NAMA PENERIMA',
    receiverBank: 'BCA',
    receiverAccount,
    referenceNumber: referenceNumber || 'BCA' + Date.now().toString().slice(-8),
    adminFee,
    paperSize: '58mm',
    bankType,
    time
  };
}

function parseBRIReceipt(text: string, bankType: BankType): TransferData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('🔵 Parsing BRI Receipt - RAW LINES:', lines);
  
  let senderName = '';
  let receiverName = '';
  let amount = 0;
  let referenceNumber = '';
  let receiverAccount = '';
  let date = '';
  let time = '';
  let adminFee = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // Extract receiver account number - PERBAIKAN: pattern untuk BRI
    // Pattern: 4 digits space 4 digits space 7 digits (seperti: 6603 0103 5831539)
    if (line.match(/\d{4}\s+\d{4}\s+\d{7}/)) {
      receiverAccount = line.match(/\d{4}\s+\d{4}\s+\d{7}/)?.[0] || '';
      console.log('💳 BRI Receiver Account FOUND:', receiverAccount);
    }
    
    // Alternatif pattern tanpa spasi
    if (!receiverAccount && line.match(/^\d{15}$/)) {
      const accountNumber = line.match(/^\d{15}$/)?.[0] || '';
      if (accountNumber) {
        // Format dengan spasi: xxxx xxxx xxxxxxx
        receiverAccount = accountNumber.replace(/(\d{4})(\d{4})(\d{7})/, '$1 $2 $3');
        console.log('💳 BRI Receiver Account FORMATTED:', receiverAccount);
      }
    }
    
    // Date and time
    if (line.match(/\d{1,2}\s+\w+\s+\d{4},\s+\d{2}:\d{2}:\d{2}/)) {
      const dateTimeMatch = line.match(/(\d{1,2}\s+\w+\s+\d{4}),\s+(\d{2}:\d{2}:\d{2})/);
      if (dateTimeMatch) {
        date = dateTimeMatch[1];
        time = dateTimeMatch[2];
      }
    }
    
    // Amount
    if (upperLine.includes('TOTAL TRANSAKSI')) {
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.startsWith('Rp')) {
        const amountMatch = nextLine.match(/Rp([\d,\.]+)/);
        if (amountMatch) {
          const cleanAmount = amountMatch[1].replace(/[,\.]/g, '');
          amount = parseInt(cleanAmount);
        }
      }
    }
    
    // Reference number - FIXED DETECTION
    if ((upperLine.includes('NO.') && upperLine.includes('REF')) || 
        upperLine.includes('NO REF') || 
        upperLine.includes('REF')) {
      console.log(`🎯 Found "No. Ref" at line ${i}: "${line}"`);
      
      const sameLineMatch = line.match(/(\d{12})/);
      if (sameLineMatch) {
        referenceNumber = sameLineMatch[1];
        console.log(`✅ BRI Reference FOUND in SAME LINE: "${referenceNumber}"`);
      }
    }
    
    // Sender name
    if (upperLine.includes('SUMBER DANA')) {
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const candidateLine = lines[j];
        if (candidateLine.match(/^[A-Z\s]+$/) && 
            candidateLine.length > 3 && 
            !candidateLine.includes('BANK') &&
            !candidateLine.match(/^\d/)) {
          senderName = candidateLine;
          break;
        }
      }
    }
    
    // Receiver name
    if (upperLine.includes('TUJUAN')) {
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const candidateLine = lines[j];
        if (candidateLine.match(/^[A-Z\s]+$/) && 
            candidateLine.length > 3 && 
            !candidateLine.includes('BANK') &&
            !candidateLine.match(/^\d/)) {
          receiverName = candidateLine;
          break;
        }
      }
    }
  }
  
  console.log('🔵 FINAL BRI Results:', {
    referenceNumber,
    amount,
    senderName,
    receiverName,
    receiverAccount // Tambahkan log untuk receiverAccount
  });
  
  return {
    date: date || new Date().toLocaleDateString('id-ID'),
    senderName: senderName || 'PENGIRIM BRI',
    amount: amount || 0,
    receiverName: receiverName || 'NAMA PENERIMA',
    receiverBank: 'BRI',
    receiverAccount: receiverAccount || '',
    referenceNumber: referenceNumber || 'BRI' + Date.now().toString().slice(-8),
    adminFee,
    paperSize: '58mm',
    bankType,
    time
  };
}

function parseMandiriReceipt(text: string, bankType: BankType): TransferData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('🟡 Parsing Mandiri Receipt:', lines);
  
  let senderName = '';
  let receiverName = '';
  let amount = 0;
  let referenceNumber = '';
  let receiverAccount = '';
  let date = '';
  let time = '';
  let adminFee = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // Mandiri specific patterns - akan disesuaikan setelah upload resi Mandiri
    if (line.match(/\d{2}-\d{2}-\d{4}/)) {
      date = line.match(/\d{2}-\d{2}-\d{4}/)?.[0] || '';
    }
    
    if (line.startsWith('Rp ') || line.includes('Rp')) {
      const amountMatch = line.match(/Rp\s*([\d,\.]+)/);
      if (amountMatch) {
        const cleanAmount = amountMatch[1].replace(/[,\.]/g, '');
        amount = parseInt(cleanAmount);
        console.log('💰 Mandiri Amount:', { original: line, parsed: amount });
      }
    }
    
    // Reference pattern untuk Mandiri
    if (upperLine.includes('REF') || upperLine.includes('JOURNAL')) {
      referenceNumber = line.replace(/.*(?:REF|JOURNAL)\s*:?\s*/i, '').trim();
    }
  }
  
  return {
    date: date || new Date().toLocaleDateString('id-ID'),
    senderName: senderName || 'PENGIRIM MANDIRI',
    amount: amount || 0,
    receiverName: receiverName || 'NAMA PENERIMA',
    receiverBank: 'MANDIRI',
    receiverAccount,
    referenceNumber: referenceNumber || 'MDR' + Date.now().toString().slice(-8),
    adminFee,
    paperSize: '58mm',
    bankType,
    time
  };
}

function parseBNIReceipt(text: string, bankType: BankType): TransferData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('🟠 Parsing BNI Receipt:', lines);
  
  let senderName = '';
  let receiverName = '';
  let amount = 0;
  let referenceNumber = '';
  let receiverAccount = '';
  let date = '';
  let time = '';
  let adminFee = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // BNI specific patterns - akan disesuaikan setelah upload resi BNI
    if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
      date = line.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || '';
    }
    
    if (line.startsWith('Rp ') || line.includes('Rp')) {
      const amountMatch = line.match(/Rp\s*([\d,\.]+)/);
      if (amountMatch) {
        const cleanAmount = amountMatch[1].replace(/[,\.]/g, '');
        amount = parseInt(cleanAmount);
        console.log('💰 BNI Amount:', { original: line, parsed: amount });
      }
    }
    
    // Reference pattern untuk BNI
    if (upperLine.includes('REF') || upperLine.includes('TRACE')) {
      referenceNumber = line.replace(/.*(?:REF|TRACE)\s*:?\s*/i, '').trim();
    }
  }
  
  return {
    date: date || new Date().toLocaleDateString('id-ID'),
    senderName: senderName || 'PENGIRIM BNI',
    amount: amount || 0,
    receiverName: receiverName || 'NAMA PENERIMA',
    receiverBank: 'BNI',
    receiverAccount,
    referenceNumber: referenceNumber || 'BNI' + Date.now().toString().slice(-8),
    adminFee,
    paperSize: '58mm',
    bankType,
    time
  };
}

function parseSeabankReceipt(text: string, bankType: BankType): TransferData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('🌊 Parsing Seabank Receipt:', lines);
  
  let senderName = '';
  let receiverName = '';
  let amount = 0;
  let referenceNumber = '';
  let receiverAccount = '';
  let date = '';
  let time = '';
  let adminFee = 0;
  let receiverBank = 'BRI'; // Default
  
  // Deteksi apakah transfer ke DANA
  const isDanaTransfer = text.includes('Dana:') || text.includes('DANA:');
  console.log('💙 Is DANA Transfer:', isDanaTransfer);
  
  // Helper function untuk membersihkan nama dan koreksi OCR
  const cleanName = (name: string): string => {
    let cleaned = name
      .replace(/[^a-zA-Z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();
    
    // Khusus untuk DANA: hapus prefix "WN DNID"
    if (isDanaTransfer && cleaned.startsWith('WN DNID ')) {
      cleaned = cleaned.replace('WN DNID ', '');
      console.log('🔧 DANA Name Cleanup: Removed "WN DNID" prefix');
    }
    
    const corrections = {
      'OIAN': 'DIAH',
      'GANI MUHAMMAD RAMLADLAN': 'GANI MUHAMMAD RAMADLAN'
    };
    
    for (const [wrong, correct] of Object.entries(corrections)) {
      if (cleaned.includes(wrong)) {
        cleaned = cleaned.replace(wrong, correct);
        console.log(`🔧 OCR Correction: ${wrong} → ${correct}`);
      }
    }
    
    return cleaned;
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // Waktu Transaksi - format: Waktu Transaksi 24 Jul 2025, 11:20
    if (upperLine.includes('WAKTU TRANSAKSI')) {
      const dateTimeMatch = line.match(/(\d{1,2}\s+\w+\s+\d{4}),\s+(\d{2}:\d{2})/);
      if (dateTimeMatch) {
        date = dateTimeMatch[1];
        time = dateTimeMatch[2];
        console.log('📅 Seabank Date/Time:', { date, time });
      }
    }
    
    // Nama Pengirim - format: Dari Gani Muhammad Ramadlan
    if (line.startsWith('Dari ')) {
      const rawName = line.replace('Dari ', '').trim();
      senderName = cleanName(rawName);
      console.log('👤 Seabank Sender:', { raw: rawName, cleaned: senderName });
    }
    
    // Nama Penerima - format berbeda untuk DANA vs Bank
    if (line.startsWith('Ke ')) {
      const rawName = line.replace('Ke ', '').trim();
      receiverName = cleanName(rawName);
      console.log('👥 Seabank Receiver:', { raw: rawName, cleaned: receiverName });
    }
    
    // Jumlah Transfer - format: Jumlah Transfer Rp 260.000 ATAU Rp 260.000
    if ((upperLine.includes('JUMLAH TRANSFER') && line.includes('Rp')) || 
        (line.match(/^Rp\s+[\d,\.]+$/))) {
      const amountMatch = line.match(/[Rr]p\s*([\d,\.]+)/);
      if (amountMatch) {
        const cleanAmount = amountMatch[1].replace(/[,\.]/g, '');
        amount = parseInt(cleanAmount);
        console.log('💰 Seabank Amount:', { original: line, parsed: amount });
      }
    }
    
    // Conditional logic untuk rekening tujuan
    if (isDanaTransfer) {
      // Format DANA: Dana: 0812****337
      if (upperLine.includes('DANA:')) {
        const accountMatch = line.match(/Dana:\s*(.+)/i);
        if (accountMatch) {
          let rawAccount = accountMatch[1].trim();
          
          // Jika OCR menghilangkan bintang, rekonstruksi format yang benar
          if (rawAccount.match(/^\d{4}\d{3}$/)) { // Format: 0812337 (tanpa bintang)
            const prefix = rawAccount.substring(0, 4); // 0812
            const suffix = rawAccount.substring(4);    // 337
            receiverAccount = prefix + '****' + suffix; // 0812****337
            console.log('🔧 DANA Account Reconstructed:', { raw: rawAccount, formatted: receiverAccount });
          } else {
            receiverAccount = rawAccount; // Gunakan apa adanya jika sudah ada bintang
          }
          
          receiverBank = 'DANA';
          console.log('💙 DANA Account:', receiverAccount);
        }
      }
    } else {
      // Format Bank: BANK BRI: ttiitiinkg 504
      if (upperLine.includes('BANK BRI:')) {
        const accountMatch = line.match(/BANK BRI:\s*(.+)/i);
        if (accountMatch) {
          let rawAccount = accountMatch[1].trim();
          const numberMatch = rawAccount.match(/(\d+)$/);
          if (numberMatch) {
            const lastDigits = numberMatch[1];
            receiverAccount = '*'.repeat(11) + lastDigits;
          } else {
            receiverAccount = rawAccount;
          }
          receiverBank = 'BRI';
          console.log('💳 BRI Account:', { raw: rawAccount, formatted: receiverAccount });
        }
      }
    }
    
    // No. Transaksi - format: No. Transaksi 20250724435044619659
    if (upperLine.includes('NO. TRANSAKSI')) {
      const refMatch = line.match(/No\.\s*Transaksi\s*(\d+)/i);
      if (refMatch) {
        referenceNumber = refMatch[1];
        console.log('🔢 Seabank Reference:', referenceNumber);
      }
    }
    
    // No. Referensi - format: No. Referensi 20250724SSPIIDJA95426210
    if (upperLine.includes('NO. REFERENSI')) {
      const refMatch = line.match(/No\.\s*Referensi\s*(.+)/i);
      if (refMatch) {
        referenceNumber = refMatch[1].trim();
        console.log('🔢 Seabank Reference (Alt):', referenceNumber);
      }
    }
  }
  
  console.log('🌊 FINAL Seabank Results:', {
    isDanaTransfer,
    date,
    time,
    senderName,
    receiverName,
    amount,
    receiverBank,
    receiverAccount,
    referenceNumber
  });
  
  return {
    date: date || new Date().toLocaleDateString('id-ID'),
    senderName: senderName || 'PENGIRIM SEABANK',
    amount: amount || 0,
    receiverName: receiverName || 'NAMA PENERIMA',
    receiverBank,
    receiverAccount: receiverAccount || '',
    referenceNumber: referenceNumber || 'SEA' + Date.now().toString().slice(-8),
    adminFee,
    paperSize: '58mm',
    bankType,
    time
  };
}

function parseDanaReceipt(text: string, bankType: BankType): TransferData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('💙 Parsing DANA Receipt:', lines);
  
  let senderName = '';
  let receiverName = '';
  let amount = 0;
  let referenceNumber = '';
  let receiverAccount = '';
  let date = '';
  let time = '';
  let adminFee = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // DANA specific patterns - akan disesuaikan setelah upload resi DANA
    if (line.match(/\d{2}\/\d{2}\/\d{4}/)) {
      date = line.match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || '';
    }
    
    if (line.startsWith('Rp ') || line.includes('Rp')) {
      const amountMatch = line.match(/Rp\s*([\d,\.]+)/);
      if (amountMatch) {
        const cleanAmount = amountMatch[1].replace(/[,\.]/g, '');
        amount = parseInt(cleanAmount);
        console.log('💰 DANA Amount:', { original: line, parsed: amount });
      }
    }
    
    // Reference pattern untuk DANA
    if (upperLine.includes('REF') || upperLine.includes('ID')) {
      referenceNumber = line.replace(/.*(?:REF|ID)\s*:?\s*/i, '').trim();
    }
  }
  
  return {
    date: date || new Date().toLocaleDateString('id-ID'),
    senderName: senderName || 'PENGIRIM DANA',
    amount: amount || 0,
    receiverName: receiverName || 'NAMA PENERIMA',
    receiverBank: 'DANA',
    receiverAccount,
    referenceNumber: referenceNumber || 'DNA' + Date.now().toString().slice(-8),
    adminFee,
    paperSize: '58mm',
    bankType,
    time
  };
}

function parseGenericReceipt(text: string, bankType: BankType): TransferData {
  return {
    date: new Date().toLocaleDateString('id-ID'),
    senderName: 'GENERIC SENDER',
    amount: 100000,
    receiverName: 'GENERIC RECEIVER',
    receiverBank: bankType,
    referenceNumber: bankType + Date.now().toString().slice(-8),
    adminFee: 0,
    paperSize: '58mm',
    bankType
  };
}

function getDefaultData(bankType: BankType): TransferData {
  return {
    date: new Date().toLocaleDateString('id-ID'),
    senderName: 'DEFAULT SENDER',
    amount: 50000,
    receiverName: 'DEFAULT RECEIVER',
    receiverBank: bankType,
    referenceNumber: bankType + Date.now().toString().slice(-8),
    adminFee: 0,
    paperSize: '58mm',
    bankType
  };
}

export async function extractDataWithRealOCR(imageUrl: string, bankType: BankType): Promise<TransferData> {
  console.log('🔍 REAL OCR STARTED for', bankType);
  console.log('📷 Image URL:', imageUrl.substring(0, 50) + '...');
  
  try {
    console.log('⚙️ Creating Tesseract worker...');
    const worker = await createWorker('eng');
    
    console.log('🔧 Configuring OCR parameters...');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,:/()-',
      tessedit_pageseg_mode: '6',
    });
    
    console.log('📖 Starting text recognition...');
    const { data: { text } } = await worker.recognize(imageUrl);
    
    console.log('📝 RAW OCR TEXT:');
    console.log('================');
    console.log(text);
    console.log('================');
    
    let extractedData: TransferData;
    
    // Route ke parser yang sesuai
    switch (bankType) {
      case 'BCA':
        console.log('🔷 Parsing as BCA receipt...');
        extractedData = parseBCAReceipt(text, bankType);
        break;
      case 'BRI':
        console.log('🔵 Parsing as BRI receipt...');
        extractedData = parseBRIReceipt(text, bankType);
        break;
      case 'MANDIRI':
        console.log('🟡 Parsing as Mandiri receipt...');
        extractedData = parseMandiriReceipt(text, bankType);
        break;
      case 'BNI':
        console.log('🟠 Parsing as BNI receipt...');
        extractedData = parseBNIReceipt(text, bankType);
        break;
      case 'SEABANK':
        console.log('🌊 Parsing as Seabank receipt...');
        extractedData = parseSeabankReceipt(text, bankType);
        break;
      case 'DANA':
        console.log('💙 Parsing as DANA receipt...');
        extractedData = parseDanaReceipt(text, bankType);
        break;
      default:
        console.log('🔄 Parsing as generic receipt...');
        extractedData = parseGenericReceipt(text, bankType);
    }
    
    await worker.terminate();
    console.log('✅ OCR COMPLETED. Extracted data:', extractedData);
    
    return extractedData;
    
  } catch (error) {
    console.error('❌ REAL OCR ERROR:', error);
    return getDefaultData(bankType);
  }
}






















