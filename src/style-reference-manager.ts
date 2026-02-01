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

export interface StyleReferenceInfo {
  name: string;
  filename: string;
  path: string;
  sizeKB: number;
  isActive: boolean;
}

export interface GenerateReferenceOptions {
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
   * Generate a new style reference grid (placeholder for Nano Banana Pro integration)
   */
  async generateStyleReference(
    templateName: string,
    options: GenerateReferenceOptions
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    const templateDir = this.getTemplateDir(templateName);
    const refsDir = path.join(templateDir, 'style-references');

    // Ensure directory exists
    if (!fs.existsSync(refsDir)) {
      fs.mkdirSync(refsDir, { recursive: true });
    }

    const outputPath = path.join(refsDir, `${options.name}.png`);

    // Build the generation prompt
    const prompt = this.buildStyleReferencePrompt(options);

    // TODO: Integrate with actual Nano Banana Pro generation
    // For now, return a placeholder message
    console.log(`[StyleReferenceManager] Would generate style reference:`);
    console.log(`  Name: ${options.name}`);
    console.log(`  Prompt: ${prompt.substring(0, 100)}...`);
    console.log(`  Output: ${outputPath}`);

    return {
      success: false,
      error: 'Style reference generation not yet implemented. Use the web UI at /illustrations for now.'
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
