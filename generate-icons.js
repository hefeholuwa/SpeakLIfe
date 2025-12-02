import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sizes required for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Read the SVG file
const svgPath = join(__dirname, 'public', 'sl-icon.svg');
const svgBuffer = readFileSync(svgPath);

console.log('🎨 Converting SL icon to PNG formats...\n');

// Convert to each size
async function generateIcons() {
    for (const size of sizes) {
        const outputPath = join(__dirname, 'public', 'icons', `icon-${size}x${size}.png`);

        try {
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(outputPath);

            console.log(`✅ Created: icon-${size}x${size}.png`);
        } catch (error) {
            console.error(`❌ Failed to create icon-${size}x${size}.png:`, error.message);
        }
    }

    console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
