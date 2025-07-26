# Solusi Nomor Referensi Panjang - Cetak Bukti Transfer

## 🔧 Masalah yang Diatasi

Nomor referensi yang panjang seringkali terpotong atau tidak terbaca dengan baik pada struk thermal, terutama pada kertas 58mm yang memiliki lebar terbatas.

## ✅ Solusi yang Diterapkan

### 1. **Smart Layout Berdasarkan Jumlah Baris**
- **1 Baris** (≤20 char untuk 80mm / ≤16 char untuk 58mm):
  - Layout horizontal normal seperti elemen lain
  - Font size normal (12px tampilan, sesuai print setting)
  - Format: `No. Ref: 1234567890`

- **2 Baris** (21-40 char untuk 80mm / 17-32 char untuk 58mm):
  - Layout vertikal dengan pemecahan baris
  - Font size normal (12px tampilan, 12px print 80mm, 11px print 58mm)
  - Text alignment: Rata kanan (konsisten dengan elemen lain)
  - Format 2 baris dengan separator (-)

- **3+ Baris** (>40 char untuk 80mm / >32 char untuk 58mm):
  - Layout vertikal dengan pemecahan baris
  - Font size kecil (10px tampilan, 9px print 80mm, 8px print 58mm)
  - Format multi-baris dengan separator (-)

### 2. **CSS Optimizations**
```css
.receipt-ref-number {
  word-break: break-all;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.2;
  font-size: 10px;
}
```

### 3. **Print-Specific Styling**
- Font size lebih kecil saat print: 9px (80mm) / 8px (58mm)
- Line height yang optimal untuk readability
- Word breaking yang konsisten di semua browser

### 4. **Visual Indicators**
- Tanda hubung (-) di akhir setiap baris (kecuali baris terakhir)
- Leading yang tight untuk menghemat ruang
- Konsistensi dengan font monospace

## 🎯 Fungsi Utama

### `formatReferenceNumber(refNumber: string)`
```typescript
const formatReferenceNumber = (refNumber: string) => {
  const maxLength = transferData.paperSize === '58mm' ? 16 : 20;

  if (refNumber.length > maxLength) {
    const chunks = [];
    for (let i = 0; i < refNumber.length; i += maxLength) {
      chunks.push(refNumber.slice(i, i + maxLength));
    }
    return chunks;
  }
  return [refNumber];
};
```

### `getReferenceNumberLines(refNumber: string)`
```typescript
const getReferenceNumberLines = (refNumber: string) => {
  const maxLength = transferData.paperSize === '58mm' ? 16 : 20;
  return Math.ceil(refNumber.length / maxLength);
};
```

### `shouldUseSmallFont(refNumber: string)`
```typescript
const shouldUseSmallFont = (refNumber: string) => {
  return getReferenceNumberLines(refNumber) >= 3;
};
```

### `shouldBreakLines(refNumber: string)`
```typescript
const shouldBreakLines = (refNumber: string) => {
  const maxLength = transferData.paperSize === '58mm' ? 16 : 20;
  return refNumber.length > maxLength;
};
```

### Nomor Rekening
- Tetap menggunakan layout `flex justify-between` yang normal
- Tidak dipecah menjadi beberapa baris karena tidak ada masalah
- Format: `<span>No. Rekening:</span> <span>{receiverAccount}</span>`

## 📱 Tampilan Hasil

### 1 Baris (≤20/16 karakter):
```
No. Ref: 1234567890          [Font normal, layout horizontal]
```

### 2 Baris (21-40/17-32 karakter):
```
No. Ref:     12345678901234567890-   [Font normal, layout vertikal, rata kanan]
                  123456789012345
```

### 3+ Baris (>40/32 karakter):
```
No. Ref: 12345678901234567890-   [Font kecil, layout vertikal]
         12345678901234567890-
         123456789012345
```

## 🖨️ Optimasi Print

### Kertas 80mm:
- Font size: 9px
- Max chars per line: 20 (ref) / 18 (account)
- Line height: 1.1

### Kertas 58mm:
- Font size: 8px
- Max chars per line: 16 (ref) / 14 (account)
- Line height: 1.0

## 🔍 Testing

### Test Cases:
1. **Nomor referensi pendek** (< 20 char): Tampil normal dalam 1 baris
2. **Nomor referensi sedang** (20-40 char): Dipecah menjadi 2 baris
3. **Nomor referensi panjang** (> 40 char): Dipecah menjadi 3+ baris
4. **Nomor rekening**: Tetap menggunakan layout horizontal normal

### Browser Compatibility:
- ✅ Chrome/Edge (Webkit)
- ✅ Firefox (Gecko)
- ✅ Safari (Webkit)
- ✅ Mobile browsers

## 🎨 Layout Structure

### Nomor Referensi Pendek:
```jsx
<div className="flex justify-between">
  <span>No. Ref:</span>
  <span className="font-mono">{referenceNumber}</span>
</div>
```

### Nomor Referensi Panjang:
```jsx
<div className="space-y-1">
  <span>No. Ref:</span>
  <div className="font-mono receipt-ref-number">
    {formatReferenceNumber(referenceNumber).map((chunk, index, array) => (
      <div key={index} className="leading-tight">
        {chunk}
        {array.length > 1 && index < array.length - 1 && (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </div>
    ))}
  </div>
</div>
```

## 🚀 Benefits

1. **Readability**: Semua karakter nomor referensi terbaca jelas
2. **Compatibility**: Bekerja di semua ukuran kertas thermal
3. **Professional**: Tampilan yang rapi dan terstruktur
4. **Responsive**: Otomatis menyesuaikan dengan ukuran kertas
5. **Print-optimized**: Khusus dioptimasi untuk thermal printer

## 📋 Implementation Notes

- Menggunakan `space-y-1` untuk spacing yang konsisten
- Font `font-mono` untuk alignment yang rapi
- `leading-tight` untuk menghemat ruang vertikal
- `text-gray-400` untuk visual separator yang subtle
- Responsive breakpoints berdasarkan `paperSize`

Solusi ini memastikan bahwa nomor referensi yang panjang tidak akan terpotong lagi dan tetap mudah dibaca pada struk thermal!
