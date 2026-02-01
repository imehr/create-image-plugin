/**
 * Nano Banana Pro Generator
 *
 * Generates style reference images using Gemini's image generation model
 * (internally called "Nano Banana Pro").
 *
 * Workflow:
 * 1. Generate 4 individual images with varied prompts
 * 2. Composite them into a 2x2 grid
 * 3. Save both individual images and the composite grid
 *
 * This matches the web UI implementation at /illustrations
 */

import * as fs from 'fs';
import * as path from 'path';

// Model configuration
const NANO_BANANA_MODEL = 'gemini-2.0-flash-preview-image-generation';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Generation settings
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const IMAGE_SIZE = 512;
const GRID_GAP = 4;
const GRID_SIZE = IMAGE_SIZE * 2 + GRID_GAP;

export interface GenerationOptions {
  description: string;
  audience?: string;
  visualStyle?: string;
  referenceImageBase64?: string;
  domainKnowledge?: string;
}

export interface GenerationResult {
  success: boolean;
  gridPath?: string;
  individualPaths?: string[];
  gridSizeKB?: number;
  generatedCount?: number;
  failedCount?: number;
  errors?: string[];
}

const AUDIENCE_STYLES: Record<string, string> = {
  'recreational': 'friendly, approachable, casual sport photography with warm colours',
  'young-athletes': 'dynamic, energetic, modern sports marketing with bold colours',
  'competitive': 'professional, intense, sports magazine editorial quality',
  'coaches': 'instructional, clear, technical demonstration focus',
  'beginners': 'welcoming, simple, easy-to-understand visual guides',
  'seniors': 'dignified, active lifestyle, age-appropriate representation',
  'tournament': 'competitive edge, professional sports photography',
};

const PROMPT_VARIATIONS = [
  'showing a player demonstrating proper form at the kitchen line with paddle ready',
  'depicting court layout with player positioning from a slight elevated angle',
  'showing two players in a rally with clear technique focus and movement',
  'illustrating a coaching drill setup from an overhead bird eye perspective',
];

async function generateSingleImage(
  prompt: string,
  options: { apiKey: string; referenceImageBase64?: string; systemInstruction?: string }
): Promise<{ success: boolean; imageBase64?: string; error?: string }> {
  const url = `${GEMINI_API_BASE}/${NANO_BANANA_MODEL}:generateContent?key=${options.apiKey}`;

  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  if (options.referenceImageBase64) {
    parts.push({
      inlineData: { mimeType: 'image/png', data: options.referenceImageBase64 },
    });
    parts.push({
      text: 'Match the visual style, colours, composition shown in this reference. Generate a NEW image following this visual language.',
    });
  }

  parts.push({ text: prompt });

  const requestBody: Record<string, unknown> = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageSizeConfig: { aspectRatio: '1:1', imageSize: '1K' },
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    ],
  };

  if (options.systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: options.systemInstruction }] };
  }

  let lastError = '';
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        lastError = `HTTP ${response.status}: ${await response.text()}`;
        console.error(`[NanoBanana] Attempt ${attempt}/${MAX_RETRIES} failed: ${lastError}`);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * Math.pow(2, attempt - 1));
          continue;
        }
        return { success: false, error: lastError };
      }

      const result = await response.json() as {
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string } }> } }>;
      };

      const imageData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!imageData) {
        return { success: false, error: 'No image data in response' };
      }

      return { success: true, imageBase64: imageData };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(`[NanoBanana] Attempt ${attempt}/${MAX_RETRIES} error: ${lastError}`);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }
  }

  return { success: false, error: lastError };
}

async function compositeToGrid(images: Buffer[]): Promise<Buffer> {
  try {
    const sharp = await import('sharp').then(m => m.default).catch(() => null);

    if (sharp) {
      while (images.length < 4) images.push(images[0] || Buffer.alloc(0));

      const resizedImages = await Promise.all(
        images.slice(0, 4).map(async (img) => {
          try {
            return await sharp(img).resize(IMAGE_SIZE, IMAGE_SIZE, { fit: 'cover' }).png().toBuffer();
          } catch { return img; }
        })
      );

      return await sharp({
        create: { width: GRID_SIZE, height: GRID_SIZE, channels: 4, background: { r: 26, g: 35, b: 50, alpha: 1 } },
      })
        .composite([
          { input: resizedImages[0], left: 0, top: 0 },
          { input: resizedImages[1], left: IMAGE_SIZE + GRID_GAP, top: 0 },
          { input: resizedImages[2], left: 0, top: IMAGE_SIZE + GRID_GAP },
          { input: resizedImages[3], left: IMAGE_SIZE + GRID_GAP, top: IMAGE_SIZE + GRID_GAP },
        ])
        .png({ compressionLevel: 9 })
        .toBuffer();
    }
  } catch (e) {
    console.warn(`[NanoBanana] Sharp not available: ${e}`);
  }
  return images[0] || Buffer.alloc(0);
}

function buildPrompt(variation: string, options: GenerationOptions): string {
  const audienceStyle = AUDIENCE_STYLES[options.audience || 'competitive'] || AUDIENCE_STYLES['competitive'];

  const parts = [
    'Generate a professional sports training illustration for pickleball coaching.',
    '',
    `SCENE: ${variation}`,
    `TARGET AUDIENCE: ${options.audience || 'competitive'}`,
    `VISUAL APPROACH: ${audienceStyle}`,
  ];

  if (options.description) parts.push('', `STYLE: ${options.description}`);
  if (options.visualStyle) parts.push('', `PREFERENCES: ${options.visualStyle}`);

  parts.push(
    '',
    'REQUIREMENTS:',
    '- Professional coaching illustration quality',
    '- Clear technique demonstration',
    '- High contrast for screen display',
    '- NO TEXT in image',
    '- Sport-accurate equipment and court',
  );

  return parts.join('\n');
}

function getApiKey(): string | null {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateStyleReferenceGrid(
  outputDir: string,
  baseName: string,
  options: GenerationOptions
): Promise<GenerationResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, errors: ['No API key. Set GOOGLE_API_KEY or GEMINI_API_KEY.'] };
  }

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`[NanoBanana] Generating style reference: ${baseName}`);
  console.log(`  Description: ${options.description || 'default'}`);
  console.log(`  Audience: ${options.audience || 'competitive'}`);

  const individualImages: Buffer[] = [];
  const individualPaths: string[] = [];
  const errors: string[] = [];
  let generatedCount = 0;

  for (let i = 0; i < PROMPT_VARIATIONS.length; i++) {
    const prompt = buildPrompt(PROMPT_VARIATIONS[i], options);
    console.log(`[NanoBanana] Generating image ${i + 1}/4...`);

    const result = await generateSingleImage(prompt, {
      apiKey,
      referenceImageBase64: options.referenceImageBase64,
      systemInstruction: options.domainKnowledge,
    });

    if (result.success && result.imageBase64) {
      const buffer = Buffer.from(result.imageBase64, 'base64');
      individualImages.push(buffer);

      const indPath = path.join(outputDir, `${baseName}-${i + 1}.png`);
      fs.writeFileSync(indPath, buffer);
      individualPaths.push(indPath);
      generatedCount++;
      console.log(`  OK Image ${i + 1} (${Math.round(buffer.length / 1024)} KB)`);
    } else {
      errors.push(`Image ${i + 1}: ${result.error}`);
      console.log(`  FAIL Image ${i + 1}: ${result.error}`);
    }

    if (i < PROMPT_VARIATIONS.length - 1) await sleep(1500);
  }

  if (individualImages.length === 0) {
    return { success: false, generatedCount: 0, failedCount: 4, errors };
  }

  console.log(`[NanoBanana] Compositing ${individualImages.length} images...`);

  try {
    const gridBuffer = await compositeToGrid(individualImages);
    const gridPath = path.join(outputDir, `${baseName}.png`);
    fs.writeFileSync(gridPath, gridBuffer);

    const gridSizeKB = Math.round(gridBuffer.length / 1024);
    console.log(`[NanoBanana] Grid saved: ${gridPath} (${gridSizeKB} KB)`);

    return {
      success: true,
      gridPath,
      individualPaths,
      gridSizeKB,
      generatedCount,
      failedCount: 4 - generatedCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    errors.push(`Grid failed: ${error instanceof Error ? error.message : error}`);
    return { success: false, individualPaths, generatedCount, failedCount: 4 - generatedCount, errors };
  }
}

export function isGenerationAvailable(): { available: boolean; reason?: string } {
  const apiKey = getApiKey();
  if (!apiKey) return { available: false, reason: 'No API key. Set GOOGLE_API_KEY.' };
  return { available: true };
}
