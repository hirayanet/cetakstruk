# 📦 Cetakresi OCR API

Endpoint backend untuk proses OCR masking dari Telegram bot maupun aplikasi eksternal.

## 🚀 Cara Pakai

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```
2. **Jalankan server (dev mode):**
   ```bash
   npm run dev
   ```
   Atau build & start production:
   ```bash
   npm run build
   npm start
   ```
3. **Endpoint utama:**
   - `POST /api/ocr`
     - Form-data: `file` (gambar struk), `bank` (nama bank, misal: SEABANK, DANA, BRI)
     - Response: hasil parsing/masking JSON

## 🔗 Contoh Request (cURL)
```bash
curl -X POST http://localhost:3001/api/ocr \
  -F "file=@/path/to/struk.jpg" \
  -F "bank=SEABANK"
```

## ⚙️ Integrasi
- Endpoint ini hanya membungkus logic masking/OCR dari modul realOCR.ts.
- Tidak mengganggu web frontend.
- Telegram bot cukup relay gambar ke endpoint ini.

## 📁 Struktur
- `index.ts` — Entrypoint server Express
- `ocr-api.ts` — Route handler /api/ocr

---

Jika butuh endpoint lain (generate PDF, dsb), tinggal tambahkan route baru.
