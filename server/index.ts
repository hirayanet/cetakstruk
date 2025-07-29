import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ocrApi from './ocr-api';
const pdfHtmlApi = require('./pdf-html-api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Register OCR API
app.use('/api', ocrApi);
app.use('/api', pdfHtmlApi);

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('OCR API server is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 OCR API server running on port ${PORT}`);
});
