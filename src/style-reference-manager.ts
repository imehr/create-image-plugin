/**
 * Style Reference Manager
 *
 * Manages style reference images for templates:
 * - List style references for a template
 * - Set active style reference
 * - Generate new style references with Nano Banana Pro
 *
 * Mirrors the web UI functionality at /illustrations
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  generateStyleReferenceGrid,
  isGenerationAvailable,
  GenerationOptions,
  GenerationResult,
  Resolution
} from './nano-banana-generator';

export interface StyleReferenceInfo {
  name: string;
  filename: string;
  path: string;
  sizeKB: number;
  isActive: boolean;
}

export interface GenerateReferenceOptions {
  resolution?: '2K' | '4K';
  name: string;
  description?: string;
  audience?: string;
  visualStyle?: string;
  refImages?: string[];
}

export class StyleReferenceManager {
  private templatesDir: string;

  constructor(repositoryPath: string) {
    this.templatesDir = path.join(repositoryPath, 'templates');
  }

  /**
   * Get the active style reference filename for a template
   */
  getActiveReference(templateName: string): string | null {
    const templateDir = this.getTemplateDir(templateName);
    const prefsPath = path.join(templateDir, '.active-reference');

    if (fs.existsSync(prefsPath)) {
      return fs.readFileSync(prefsPath, 'utf-8').trim() || null;
    }
    return null;
  }

  /**
   * Set the active style reference for a template
   */
  setActiveReference(templateName: string, filename: string): void {
    const templateDir = this.getTemplateDir(templateName);
    const refsDir = path.join(templateDir, 'style-references');
    const fullPath = path.join(refsDir, filename);

    // Verify the file exists
    if (!fs.existsSync(fullPath)) {
      // Try adding .png extension
      const withPng = filename.endsWith('.png') ? filename : `${filename}.png`;
      if (fs.existsSync(path.join(refsDir, withPng))) {
        filename = withPng;
      } else {
        throw new Error(`Style reference not found: ${filename}`);
      }
    }

    fs.writeFileSync(path.join(templateDir, '.active-reference'), filename, 'utf-8');
  }

  /**
   * List all style references for a template
   */
  listStyleReferences(templateName: string): StyleReferenceInfo[] {
    const templateDir = this.getTemplateDir(templateName);
    const refsDir = path.join(templateDir, 'style-references');
    const activeRef = this.getActiveReference(templateName);
    const references: StyleReferenceInfo[] = [];

    if (!fs.existsSync(refsDir)) {
      return references;
    }

    const files = fs.readdirSync(refsDir).filter(f => /\.(png|jpe?g)$/i.test(f));

    for (const file of files) {
      const filePath = path.join(refsDir, file);
      const stat = fs.statSync(filePath);

      references.push({
        name: path.basename(file, path.extname(file)),
        filename: file,
        path: filePath,
        sizeKB: Math.round(stat.size / 1024),
        isActive: file === activeRef,
      });
    }

    return references;
  }

  /**
   * Get the full path to the active style reference image
   */
  getActiveReferencePath(templateName: string): string | null {
    const activeRef = this.getActiveReference(templateName);
    if (!activeRef) return null;

    const templateDir = this.getTemplateDir(templateName);
    const refPath = path.join(templateDir, 'style-references', activeRef);

    return fs.existsSync(refPath) ? refPath : null;
  }

  /**
   * Load the active style reference as base64
   */
  loadActiveReferenceBase64(templateName: string): string | null {
    const refPath = this.getActiveReferencePath(templateName);
    if (!refPath) return null;

    try {
      return fs.readFileSync(refPath).toString('base64');
    } catch {
      return null;
    }
  }

  /**
   * Check if Nano Banana Pro generation is available
   */
  checkGenerationAvailability(): { available: boolean; reason?: string } {
    return isGenerationAvailable();
  }

  /**
   * Generate a new style reference grid using Nano Banana Pro
   */
  async generateStyleReference(
    templateName: string,
    options: GenerateReferenceOptions
  ): Promise<{ success: boolean; path?: string; individualPaths?: string[]; gridSizeKB?: number; error?: string }> {
    // Check if generation is available
    const availability = isGenerationAvailable();
    if (!availability.available) {
      return { success: false, error: availability.reason };
    }

    const templateDir = this.getTemplateDir(templateName);
    const refsDir = path.join(templateDir, 'style-references');

    // Ensure directory exists
    if (!fs.existsSync(refsDir)) {
      fs.mkdirSync(refsDir, { recursive: true });
    }

    // Load existing reference image if specified
    let referenceImageBase64: string | undefined;
    if (options.refImages && options.refImages.length > 0) {
      const refPath = options.refImages[0];
      if (fs.existsSync(refPath)) {
        referenceImageBase64 = fs.readFileSync(refPath).toString('base64');
      }
    }

    // Load domain knowledge for the template
    let domainKnowledge: string | undefined;
    const domainKnowledgePath = path.join(templateDir, 'domain-knowledge.txt');
    if (fs.existsSync(domainKnowledgePath)) {
      domainKnowledge = fs.readFileSync(domainKnowledgePath, 'utf-8');
    }

    // Generate the style reference grid
    const generationOptions: GenerationOptions = {
      resolution: options.resolution || '2K',
      description: options.description || options.name,
      audience: options.audience,
      visualStyle: options.visualStyle,
      referenceImageBase64,
      domainKnowledge,
    };

    console.log(`[StyleReferenceManager] Generating style reference with Nano Banana Pro`);
    console.log(`  Template: ${templateName}`);
    console.log(`  Name: ${options.name}`);
    console.log(`  Audience: ${options.audience || 'competitive'}`);

    const result: GenerationResult = await generateStyleReferenceGrid(
      refsDir,
      options.name,
      generationOptions
    );

    if (result.success && result.gridPath) {
      // Auto-set as active reference
      this.setActiveReference(templateName, `${options.name}.png`);

      return {
        success: true,
        path: result.gridPath,
        individualPaths: result.individualPaths,
        gridSizeKB: result.gridSizeKB,
      };
    }

    return {
      success: false,
      error: result.errors?.join('; ') || 'Generation failed',
    };
  }

  /**
   * Build prompt for style reference generation
   */
  private buildStyleReferencePrompt(options: GenerateReferenceOptions): string {
    const audienceStyles: Record<string, string> = {
      'recreational': 'friendly, approachable, casual sport photography',
      'young-athletes': 'dynamic, energetic, modern sports marketing for youth',
      'competitive': 'professional, intense, sports magazine editorial quality',
      'coaches': 'instructional, clear, technical demonstration focus',
      'beginners': 'welcoming, simple, easy-to-understand visual guides',
      'seniors': 'dignified, active lifestyle, age-appropriate representation',
      'tournament': 'competitive edge, professional sports photography',
    };

    const audienceStyle = audienceStyles[options.audience || 'competitive'] || audienceStyles['competitive'];

    const parts = [
      'Create a 2x2 grid of coaching illustration style reference images.',
      '',
      'GRID LAYOUT: 4 distinct examples showing consistent style applied to:',
      '1. Player serving technique',
      '2. Player at kitchen line dinking',
      '3. Court positioning diagram',
      '4. Drill instruction visual',
      '',
      `TARGET AUDIENCE: ${options.audience || 'competitive'}`,
      `AUDIENCE STYLE: ${audienceStyle}`,
    ];

    if (options.description) {
      parts.push('', `STYLE DESCRIPTION: ${options.description}`);
    }

    if (options.visualStyle) {
      parts.push('', `VISUAL PREFERENCES: ${options.visualStyle}`);
    }

    parts.push('', 'OUTPUT: Cohesive 2x2 grid showing unified visual language.');

    return parts.join('\n');
  }

  /**
   * Get template directory path
   */
  private getTemplateDir(templateName: string): string {
    const templateDir = path.join(this.templatesDir, templateName);
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return templateDir;
  }
}
