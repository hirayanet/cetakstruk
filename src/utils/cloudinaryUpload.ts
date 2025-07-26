const CLOUDINARY_CLOUD_NAME = 'dmwjamvwk';
const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Default unsigned preset

export async function uploadReceiptToCloudinary(blob: Blob, fileName: string): Promise<string> {
  try {
    console.log('☁️ Uploading to Cloudinary...');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('public_id', fileName);
    formData.append('folder', 'receipts');
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error('Cloudinary upload failed: ' + data.error.message);
    }
    
    const imageUrl = data.secure_url;
    console.log('✅ Upload successful! URL:', imageUrl);
    
    return imageUrl;
    
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw new Error('Failed to upload receipt to cloud storage');
  }
}

export function generateFileName(bankType: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `struk-${bankType}-${timestamp}-${randomId}`;
}