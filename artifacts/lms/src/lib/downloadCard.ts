import html2canvas from 'html2canvas';

/**
 * Converts an image URL to a base64 data URL so html2canvas can render it
 * without CORS issues.
 */
async function toDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(''); // silently skip if logo fails
    img.src = url;
  });
}

/**
 * Downloads the element with id="library-card-print" as a PNG.
 * Replaces all <img> src attributes with base64 before capturing so
 * html2canvas renders them correctly (avoids CORS blank images).
 */
export async function downloadLibraryCard(filename: string): Promise<void> {
  const el = document.getElementById('library-card-print');
  if (!el) return;

  // Temporarily swap all img srcs to base64
  const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];
  const origSrcs = imgs.map(img => img.src);

  await Promise.all(
    imgs.map(async (img) => {
      if (img.src && !img.src.startsWith('data:')) {
        const b64 = await toDataUrl(img.src);
        if (b64) img.src = b64;
      }
    })
  );

  try {
    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    a.click();
  } finally {
    // Restore original srcs
    imgs.forEach((img, i) => { img.src = origSrcs[i]; });
  }
}
