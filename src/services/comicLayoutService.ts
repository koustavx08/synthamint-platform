import type { StoryGenerationResult } from './aiStoryService';

export interface ComicLayoutOptions {
  imageUrls: string[];
  layout?: 'horizontal' | 'vertical';
  width?: number;
  height?: number;
}

export interface ComicLayoutResult {
  comicUrl: string; // Data URL or blob URL of the combined comic image
}

/**
 * Combines multiple images into a single comic strip (horizontal or vertical).
 * Uses HTML Canvas in-browser for composition.
 */
export async function createComicLayout(options: ComicLayoutOptions): Promise<ComicLayoutResult> {
  const { imageUrls, layout = 'horizontal', width = 1024, height = 1024 } = options;
  if (!imageUrls.length) throw new Error('No images provided');

  // Load all images
  const images = await Promise.all(
    imageUrls.map(
      url => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      })
    )
  );

  // Determine canvas size
  const panelCount = images.length;
  const panelWidth = layout === 'horizontal' ? width : width;
  const panelHeight = layout === 'vertical' ? height : height;
  const canvasWidth = layout === 'horizontal' ? width * panelCount : width;
  const canvasHeight = layout === 'vertical' ? height * panelCount : height;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Draw each image
  images.forEach((img, i) => {
    const x = layout === 'horizontal' ? i * width : 0;
    const y = layout === 'vertical' ? i * height : 0;
    ctx.drawImage(img, x, y, width, height);
  });

  // Export as data URL
  const comicUrl = canvas.toDataURL('image/png');
  return { comicUrl };
}
