/**
 * Safely export array of objects to CSV, escaping formula injection attacks.
 */
export function exportToCSV(data, filename = 'lumyn_export.csv') {
  if (!data || !data.length) {
    throw new Error('No data available to export.');
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((fieldName) => {
        let val = row[fieldName];
        if (val === null || val === undefined) {
          return '""';
        }
        val = String(val);
        // CSV Formula Injection mitigation: escape values starting with =, +, -, @
        if (/^[=+\-@]/.test(val)) {
          val = `'${val}`;
        }
        // Escape quotes
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );

  const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger browser print dialog for printable dashboard layout.
 */
export function triggerPrint() {
  window.print();
}

/**
 * Capture an SVG chart element and trigger PNG download.
 */
export function exportChartAsPNG(svgElementId, filename = 'chart.png') {
  try {
    const container = document.getElementById(svgElementId);
    if (!container) throw new Error('Chart container element not found.');

    const svg = container.querySelector('svg');
    if (!svg) throw new Error('SVG element not found in chart.');

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const svgSize = svg.getBoundingClientRect();
    canvas.width = (svgSize.width || 600) * 2;
    canvas.height = (svgSize.height || 400) * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Background fill
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const a = document.createElement('a');
      a.download = filename;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  } catch (err) {
    console.error('Failed to export chart as PNG:', err);
    throw err;
  }
}
