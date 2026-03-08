import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = './public/icons/icon-512x512.png';
const outputDir = './public/icons';

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }
  console.log('All icons generated!');
}

generateIcons().catch(console.error);
