/**
 * Utility to download base64 data URL reliably by converting it into a Blob Object URL.
 * Bypasses iframe sandbox download policies in most browsers.
 */
export function downloadBase64File(base64Data: string, fileName: string) {
  try {
    if (!base64Data) return;
    
    // Split the header and the base64 content
    const parts = base64Data.split(';base64,');
    if (parts.length !== 2) {
      // Fallback for plain URL or unsupported formats
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    const mimeType = parts[0].split(':')[1] || 'image/png';
    const binaryStr = atob(parts[1]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up memory
    setTimeout(() => URL.revokeObjectURL(url), 300);
  } catch (err) {
    console.error('Failed to download base64 file:', err);
    // Ultimate fallback
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Utility to print base64 data URL reliably by opening in a new tab.
 */
export function printBase64File(base64Data: string, title: string) {
  try {
    if (!base64Data) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Print blocked. Please allow popups in your browser! ⚠️');
      return;
    }
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: white; font-family: sans-serif; }
            .container { text-align: center; max-width: 100%; padding: 20px; }
            img { max-width: 100%; max-height: 85vh; object-fit: contain; border: 1px solid #ddd; padding: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            h2 { font-size: 16px; color: #333; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>${title}</h2>
            <img src="${base64Data}" />
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (err) {
    console.error('Failed to print document:', err);
  }
}

