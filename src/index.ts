/**
 * Create-Image Plugin Entry Point
 *
 * Universal AI image generation plugin for Claude Code.
 * Supports templates, style references, domain knowledge,
 * and multi-provider fallback.
 */

import * as path from 'path';
import * as os from 'os';
import { ImageOrchestrator } from './orchestrator';
import { PluginContext, ImageGenerationRequest, ImageGenerationResult } from './types';
import { StyleReferenceManager } from './style-reference-manager';
import { DomainKnowledgeManager } from './domain-knowledge-manager';
import { ActiveTemplateManager } from './active-template-manager';

// Export types
export * from './types';

// Export core components
export { ImageOrchestrator } from './orchestrator';
export { ConfigLoader } from './config-loader';
export { TemplateLoader } from './template-loader';
export { ProviderManager } from './provider-manager';

// Export new managers (matching web UI functionality)
export { StyleReferenceManager } from './style-reference-manager';
export { DomainKnowledgeManager } from './domain-knowledge-manager';
export { ActiveTemplateManager } from './active-template-manager';

// Export Nano Banana Pro generator
export {
  generateStyleReferenceGrid,
  isGenerationAvailable,
  GenerationOptions,
  GenerationResult
} from './nano-banana-generator';

/**
 * Create and initialize the create-image plugin
 */
export async function createPlugin(cwd: string = process.cwd()): Promise<CreateImagePlugin> {
  const repositoryPath = path.join(os.homedir(), 'Documents', 'github', 'image-generator');

  const context: PluginContext = {
    configDir: path.join(os.homedir(), '.config', 'create-image'),
    repositoryPath,
    cwd
  };

  const orchestrator = new ImageOrchestrator(context);
  const styleRefManager = new StyleReferenceManager(repositoryPath);
  const domainKnowledgeManager = new DomainKnowledgeManager(repositoryPath);
  const activeTemplateManager = new ActiveTemplateManager(repositoryPath);

  return {
    name: 'create-image',
    version: '2.0.0',
    orchestrator,
    styleRefManager,
    domainKnowledgeManager,
    activeTemplateManager,

    async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
      return orchestrator.generateImage(request);
    },

    async listTemplates(): Promise<string> {
      return orchestrator.listTemplates();
    },

    // Style reference management
    listStyleReferences(templateName: string) {
      return styleRefManager.listStyleReferences(templateName);
    },

    setActiveReference(templateName: string, filename: string) {
      return styleRefManager.setActiveReference(templateName, filename);
    },

    getActiveReference(templateName: string) {
      return styleRefManager.getActiveReference(templateName);
    },

    // Domain knowledge management
    getDomainKnowledge(templateName: string) {
      return domainKnowledgeManager.getDomainKnowledge(templateName);
    },

    updateDomainKnowledge(templateName: string, content: string) {
      return domainKnowledgeManager.updateDomainKnowledge(templateName, content);
    },

    // Active template management
    getActiveTemplate() {
      return activeTemplateManager.getActiveTemplate();
    },

    setActiveTemplate(templateName: string) {
      return activeTemplateManager.setActiveTemplate(templateName);
    }
  };
}

export interface CreateImagePlugin {
  name: string;
  version: string;
  orchestrator: ImageOrchestrator;
  styleRefManager: StyleReferenceManager;
  domainKnowledgeManager: DomainKnowledgeManager;
  activeTemplateManager: ActiveTemplateManager;

  // Image generation
  generate(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
  listTemplates(): Promise<string>;

  // Style reference management
  listStyleReferences(templateName: string): ReturnType<StyleReferenceManager['listStyleReferences']>;
  setActiveReference(templateName: string, filename: string): void;
  getActiveReference(templateName: string): string | null;

  // Domain knowledge management
  getDomainKnowledge(templateName: string): ReturnType<DomainKnowledgeManager['getDomainKnowledge']>;
  updateDomainKnowledge(templateName: string, content: string): ReturnType<DomainKnowledgeManager['updateDomainKnowledge']>;

  // Active template management
  getActiveTemplate(): string;
  setActiveTemplate(templateName: string): void;
}

export default createPlugin;
