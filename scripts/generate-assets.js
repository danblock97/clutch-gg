import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateAssets() {
  const logoPath = path.join(__dirname, '../public/images/logo.png');
  const publicDir = path.join(__dirname, '../public');
  const imagesDir = path.join(publicDir, 'images');

  try {
    // Check if logo exists
    await fs.access(logoPath);
    console.log('✅ Logo found, generating assets...');

    // Generate favicon.ico (48x48)
    await sharp(logoPath)
      .resize(48, 48)
      .png()
      .toFile(path.join(publicDir, 'favicon.ico'));
    console.log('✅ Generated favicon.ico');

    // Generate apple-touch-icon.png (180x180)
    await sharp(logoPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('✅ Generated apple-touch-icon.png');

    // Generate PWA icons
    await sharp(logoPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(imagesDir, 'icon-192x192.png'));
    console.log('✅ Generated icon-192x192.png');

    await sharp(logoPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(imagesDir, 'icon-512x512.png'));
    console.log('✅ Generated icon-512x512.png');

    // Generate social media images (1200x630)
    // Create a background with logo centered
    const socialBg = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 14, g: 16, b: 21, alpha: 1 } // Your app's background color
      }
    }).png();

    const logo = await sharp(logoPath)
      .resize(300, 300)
      .png()
      .toBuffer();

    await socialBg
      .composite([{
        input: logo,
        top: 165, // Center vertically (630-300)/2
        left: 450 // Center horizontally (1200-300)/2
      }])
      .toFile(path.join(imagesDir, 'og-image.png'));
    console.log('✅ Generated og-image.png');

    await socialBg
      .composite([{
        input: logo,
        top: 165,
        left: 450
      }])
      .toFile(path.join(imagesDir, 'twitter-image.png'));
    console.log('✅ Generated twitter-image.png');

    // Generate placeholder screenshot images
    // Wide screenshot (1280x720)
    await sharp({
      create: {
        width: 1280,
        height: 720,
        channels: 4,
        background: { r: 14, g: 16, b: 21, alpha: 1 }
      }
    })
    .composite([{
      input: await sharp(logoPath).resize(200, 200).png().toBuffer(),
      top: 260,
      left: 540
    }])
    .png()
    .toFile(path.join(imagesDir, 'screenshot-wide.png'));
    console.log('✅ Generated screenshot-wide.png');

    // Narrow screenshot (750x1334)
    await sharp({
      create: {
        width: 750,
        height: 1334,
        channels: 4,
        background: { r: 14, g: 16, b: 21, alpha: 1 }
      }
    })
    .composite([{
      input: await sharp(logoPath).resize(150, 150).png().toBuffer(),
      top: 592,
      left: 300
    }])
    .png()
    .toFile(path.join(imagesDir, 'screenshot-narrow.png'));
    console.log('✅ Generated screenshot-narrow.png');

    console.log('\n🎉 All assets generated successfully!');
    console.log('\nGenerated files:');
    console.log('- /public/favicon.ico');
    console.log('- /public/apple-touch-icon.png');
    console.log('- /public/images/icon-192x192.png');
    console.log('- /public/images/icon-512x512.png');
    console.log('- /public/images/og-image.png');
    console.log('- /public/images/twitter-image.png');
    console.log('- /public/images/screenshot-wide.png');
    console.log('- /public/images/screenshot-narrow.png');

  } catch (error) {
    console.error('❌ Error generating assets:', error);
  }
}

generateAssets();