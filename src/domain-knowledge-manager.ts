/**
 * Domain Knowledge Manager
 *
 * Manages domain knowledge (system instructions) for templates:
 * - View domain knowledge
 * - Update domain knowledge from file or inline
 * - Append rules
 *
 * Mirrors the web UI "Illustration Rules" tab functionality
 */

import * as fs from 'fs';
import * as path from 'path';

export interface DomainKnowledgeInfo {
  content: string;
  lineCount: number;
  sizeBytes: number;
  path: string;
}

export class DomainKnowledgeManager {
  private templatesDir: string;

  constructor(repositoryPath: string) {
    this.templatesDir = path.join(repositoryPath, 'templates');
  }

  /**
   * Get domain knowledge for a template
   */
  getDomainKnowledge(templateName: string): DomainKnowledgeInfo | null {
    const templateDir = this.getTemplateDir(templateName);
    const dkPath = path.join(templateDir, 'domain-knowledge.txt');

    if (!fs.existsSync(dkPath)) {
      return null;
    }

    const content = fs.readFileSync(dkPath, 'utf-8');

    return {
      content,
      lineCount: content.split('\n').length,
      sizeBytes: Buffer.byteLength(content, 'utf-8'),
      path: dkPath,
    };
  }

  /**
   * Update domain knowledge from content string
   */
  updateDomainKnowledge(templateName: string, content: string): DomainKnowledgeInfo {
    const templateDir = this.getTemplateDir(templateName);
    const dkPath = path.join(templateDir, 'domain-knowledge.txt');

    fs.writeFileSync(dkPath, content, 'utf-8');

    return {
      content,
      lineCount: content.split('\n').length,
      sizeBytes: Buffer.byteLength(content, 'utf-8'),
      path: dkPath,
    };
  }

  /**
   * Update domain knowledge from file
   */
  updateFromFile(templateName: string, filePath: string): DomainKnowledgeInfo {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return this.updateDomainKnowledge(templateName, content);
  }

  /**
   * Append text to domain knowledge
   */
  appendToDomainKnowledge(templateName: string, text: string): DomainKnowledgeInfo {
    const current = this.getDomainKnowledge(templateName);
    const currentContent = current?.content || '';

    // Add newlines if needed
    const separator = currentContent.endsWith('\n') ? '\n' : '\n\n';
    const newContent = currentContent + separator + text + '\n';

    return this.updateDomainKnowledge(templateName, newContent);
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
