// Utility to export a DOM node to a PNG using html-to-image
// Ensures high-DPI output and safe defaults.
import { toPng } from 'html-to-image';

export async function exportNodeToPng(node, filename = 'clutchgg-card.png', pixelRatio = 2) {
  if (!node) throw new Error('exportNodeToPng: node is required');
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: pixelRatio || window.devicePixelRatio || 2,
    imagePlaceholder: undefined,
    // Inline fonts and images as much as possible
    skipFonts: false,
    // Keep transparent background; the export frame should set its own bg
    backgroundColor: undefined,
    style: {
      // Avoid animations during capture
      transition: 'none',
      animation: 'none',
    },
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
