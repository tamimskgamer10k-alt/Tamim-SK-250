export function formatBytes(bytes: number, decimals = 2): string {
  if (!+bytes || bytes < 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed-file';
  // Remove path traversal and dangerous characters
  const clean = filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\.{2,}/g, '.')
    .trim();
  return clean || 'unnamed-file';
}

export function detectMimeCategory(
  mimeType: string,
  filename: string
): 'video' | 'audio' | 'image' | 'document' | 'archive' | 'other' {
  const lowerType = (mimeType || '').toLowerCase();
  const lowerName = (filename || '').toLowerCase();

  if (lowerType.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi|flv|wmv|m4v)$/i.test(lowerName)) {
    return 'video';
  }
  if (lowerType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|weba)$/i.test(lowerName)) {
    return 'audio';
  }
  if (lowerType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(lowerName)) {
    return 'image';
  }
  if (lowerType.includes('pdf') || /\.(pdf|doc|docx|txt|xls|xlsx|ppt|pptx|csv|md)$/i.test(lowerName)) {
    return 'document';
  }
  if (lowerType.includes('zip') || lowerType.includes('tar') || /\.(zip|rar|7z|tar|gz)$/i.test(lowerName)) {
    return 'archive';
  }
  return 'other';
}

export async function convertImageFormat(
  file: File | Blob,
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp',
  quality = 0.92
): Promise<{ blob: Blob; dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas 2D context'));
          return;
        }
        // Fill white background for JPEGs to prevent black transparency
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas image conversion failed'));
              return;
            }
            const dataUrl = canvas.toDataURL(targetFormat, quality);
            resolve({ blob, dataUrl, size: blob.size });
          },
          targetFormat,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for conversion'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
