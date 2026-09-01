/**
 * Utility to compress images on the client side before converting to Base64
 * This prevents Firestore 1MB document size limit errors.
 */

export async function compressImageFile(
  fileOrBlob: File | Blob | string,
  maxWidth: number = 1000,
  maxHeight: number = 1000,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's already a small data URL or string, handle accordingly
    if (typeof fileOrBlob === 'string') {
      if (!fileOrBlob.startsWith('data:image')) {
        resolve(fileOrBlob);
        return;
      }
      // If it's already a data URL, create an image and compress
      const img = new Image();
      img.onload = () => {
        const compressed = resizeAndCompressImage(img, maxWidth, maxHeight, quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(fileOrBlob);
      img.src = fileOrBlob;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const compressed = resizeAndCompressImage(img, maxWidth, maxHeight, quality);
        resolve(compressed);
      };
      img.onerror = () => {
        resolve(result);
      };
      img.src = result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(fileOrBlob);
  });
}

function resizeAndCompressImage(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  quality: number
): string {
  let width = img.width || 800;
  let height = img.height || 800;

  if (width > height) {
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return img.src;
  }

  // White background for JPEG conversion of transparent PNGs
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}
