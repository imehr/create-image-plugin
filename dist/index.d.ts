/**
 * Create-Image Plugin Entry Point
 *
 * Universal AI image generation plugin for Claude Code.
 * Supports templates, style references, domain knowledge,
 * and multi-provider fallback.
 */
import { ImageOrchestrator } from './orchestrator';
import { ImageGenerationRequest, ImageGenerationResult } from './types';
import { StyleReferenceManager } from './style-reference-manager';
import { DomainKnowledgeManager } from './domain-knowledge-manager';
import { ActiveTemplateManager } from './active-template-manager';
export * from './types';
export { ImageOrchestrator } from './orchestrator';
export { ConfigLoader } from './config-loader';
export { TemplateLoader } from './template-loader';
export { ProviderManager } from './provider-manager';
export { StyleReferenceManager } from './style-reference-manager';
export { DomainKnowledgeManager } from './domain-knowledge-manager';
export { ActiveTemplateManager } from './active-template-manager';
/**
 * Create and initialize the create-image plugin
 */
export declare function createPlugin(cwd?: string): Promise<CreateImagePlugin>;
export interface CreateImagePlugin {
    name: string;
    version: string;
    orchestrator: ImageOrchestrator;
    styleRefManager: StyleReferenceManager;
    domainKnowledgeManager: DomainKnowledgeManager;
    activeTemplateManager: ActiveTemplateManager;
    generate(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
    listTemplates(): Promise<string>;
    listStyleReferences(templateName: string): ReturnType<StyleReferenceManager['listStyleReferences']>;
    setActiveReference(templateName: string, filename: string): void;
    getActiveReference(templateName: string): string | null;
    getDomainKnowledge(templateName: string): ReturnType<DomainKnowledgeManager['getDomainKnowledge']>;
    updateDomainKnowledge(templateName: string, content: string): ReturnType<DomainKnowledgeManager['updateDomainKnowledge']>;
    getActiveTemplate(): string;
    setActiveTemplate(templateName: string): void;
}
export default createPlugin;
//# sourceMappingURL=index.d.ts.map