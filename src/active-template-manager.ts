/**
 * Active Template Manager
 *
 * Manages which template is currently active for image generation.
 * Mirrors the web UI active template selection.
 */

import * as fs from 'fs';
import * as path from 'path';

export class ActiveTemplateManager {
  private templatesDir: string;
  private activeStylePath: string;

  constructor(repositoryPath: string) {
    this.templatesDir = path.join(repositoryPath, 'templates');
    this.activeStylePath = path.join(this.templatesDir, '.active-style');
  }

  /**
   * Get the currently active template name
   */
  getActiveTemplate(): string {
    if (fs.existsSync(this.activeStylePath)) {
      const content = fs.readFileSync(this.activeStylePath, 'utf-8').trim();
      if (content) return content;
    }
    return 'sports/illustrative'; // Default
  }

  /**
   * Set the active template
   */
  setActiveTemplate(templateName: string): void {
    const templateDir = path.join(this.templatesDir, templateName);

    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    fs.writeFileSync(this.activeStylePath, templateName, 'utf-8');
  }

  /**
   * Check if a template is the active one
   */
  isActive(templateName: string): boolean {
    return this.getActiveTemplate() === templateName;
  }

  /**
   * Get full path to active template directory
   */
  getActiveTemplateDir(): string {
    return path.join(this.templatesDir, this.getActiveTemplate());
  }
}
