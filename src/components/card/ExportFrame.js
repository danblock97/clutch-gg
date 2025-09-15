"use client";
import React, { useMemo } from "react";

// Lightweight export frame that wraps a card with branded background + header.
// It is intended to be rendered off-screen for capture.
export default function ExportFrame({
  children,
  appName = "clutchgg.lol",
  watermarkText = "clutchgg.lol",
  padding = 32,
  width,
  height,
}) {
  // Create a tiled SVG text pattern for watermark; kept subtle.
  const watermarkDataUrl = useMemo(() => {
    const text = encodeURIComponent(watermarkText);
    const svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120">',
      '<defs>\n<style>\n@font-face{font-family:Inter;src:local(Inter), local(Inter-Regular);}\n</style>',
      '</defs>',
      '<rect width="100%" height="100%" fill="none"/>',
      '<g fill="none" stroke="none">',
      '<g transform="rotate(-20 120 60)">',
      `<text x="10" y="40" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="18" fill="rgba(255,255,255,0.08)" letter-spacing="2">${text}</text>`,
      `<text x="120" y="90" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="18" fill="rgba(255,255,255,0.08)" letter-spacing="2">${text}</text>`,
      '</g>',
      '</g>',
      '</svg>'
    ].join("");
    return `url("data:image/svg+xml;utf8,${svg}")`;
  }, [watermarkText]);

  const frameStyle = {
    // Allow caller to size around the card; otherwise wrap content.
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    alignItems: 'center',
    justifyItems: 'center',
    gap: 12,
    boxSizing: 'border-box',
    padding: `${padding}px`,
    // Branded background
    background: 'radial-gradient(1200px circle at 20% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(900px circle at 110% 110%, rgba(34,197,94,0.14), transparent 50%), linear-gradient(180deg, #0b0f14, #0d1218)',
    backgroundImage: `linear-gradient(180deg, #0b0f14, #0d1218), ${watermarkDataUrl}`,
    backgroundBlendMode: 'normal, normal',
    backgroundRepeat: 'no-repeat, repeat',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
  };

  const headerStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 800,
    letterSpacing: 1,
  };

  const appStyle = {
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.95,
  };

  const footerStyle = {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.6)',
  };

  return (
    <div style={frameStyle}>
      {/* Header with app name and subtle badge */}
      <div style={headerStyle}>
        <div style={appStyle}>{appName}</div>
      </div>
      {/* Centered card */}
      <div style={{ display: 'grid', placeItems: 'center' }}>
        {children}
      </div>
      {/* Footer stamp */}
      <div style={footerStyle}>{watermarkText}</div>
    </div>
  );
}
