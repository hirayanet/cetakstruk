// Utility untuk resize & compress gambar di browser tanpa mengurangi akurasi OCR
// Menggunakan HTMLCanvasElement bawaan browser (tanpa dependency eksternal)

export interface CompressOptions {
  maxWidth?: number; // default: 1024
  maxHeight?: number; // default: 1024
  quality?: number; // 0.6 - 1 (default: 0.8)
  mimeType?: string; // default: 'image/jpeg'
}

export async function compressImage(file: File, options: CompressOptions = {}): Promise<Blob> {
  const { maxWidth = 1024, maxHeight = 1024, quality = 0.8, mimeType = 'image/jpeg' } = options;
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      let scale = Math.min(maxWidth / width, maxHeight / height, 1);
      let targetWidth = Math.round(width * scale);
      let targetHeight = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context error');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject('Compression failed');
        },
        mimeType,
        quality
      );
    };
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(file);
  });
}
