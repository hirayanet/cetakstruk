import express, { Request, Response } from 'express';
import { generatePDF } from './pdfGenerator';
import multer from 'multer';
import path = require('path');
import fs = require('fs');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// Endpoint POST /api/ocr
router.post('/ocr', upload.single('file'), async (req: Request, res: Response) => {
  try {
    console.log('--- [API] /ocr called ---');
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const bank = req.body.bank || '';
    const filePath = req.file.path;
    console.log('File uploaded:', filePath, 'Bank:', bank);

    // Hybrid dynamic import: path absolute, .ts untuk dev, .js untuk prod
    let realOCR, extractDataWithRealOCR;
    try {
      const path = require('path');
      const env = process.env.NODE_ENV;
      let realOcrPath;
      if (env === 'production') {
        // Production: import hasil JS di dist
        realOcrPath = path.resolve(__dirname, './src/utils/realOCR.js');
      } else {
        // Dev: import TS langsung dari root project
        realOcrPath = path.resolve(__dirname, '../../src/utils/realOCR.ts');
      }
      console.log('[IMPORT][realOCR] NODE_ENV:', env, '| path:', realOcrPath);
      realOCR = await import(realOcrPath);
      extractDataWithRealOCR = realOCR.extractDataWithRealOCR;
    } catch (err) {
      console.error('Failed to import realOCR:', err);
      throw err;
    }

    let result;
    try {
      result = await extractDataWithRealOCR(filePath, bank);
      console.log('OCR result:', result);
    } catch (err) {
      console.error('extractDataWithRealOCR error:', err);
      throw err;
    }

    // Hapus file setelah proses
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Failed to delete temp file:', err);
    }
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('OCR API error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
});

// Endpoint POST /api/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const pdfBuffer = await generatePDF(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="bukti-transfer.pdf"');
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error('PDF Generator error:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
});

export = router;
