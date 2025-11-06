import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Image metadata
export const alt = 'About Templify';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  const imagePath = join(process.cwd(), 'public', 'images', 'og_image.png');
  const imageBuffer = await readFile(imagePath);

  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
