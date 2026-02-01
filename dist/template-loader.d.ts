/**
 * Template Loader
 *
 * Fast template loading with:
 * - Registry-based lookup (templates/registry.json)
 * - In-memory caching
 * - Template metadata extraction
 * - Style guide and prompt merging
 */
import { Template, TemplateMetadata, TemplateRegistry } from './types';
export declare class TemplateLoader {
    private repositoryPath;
    private templatesDir;
    private registryPath;
    private cache;
    private registry?;
    private cacheTTL;
    constructor(repositoryPath: string, cacheTTL?: number);
    /**
     * Load a template by name (topic/style format)
     */
    load(templateName: string): Promise<Template | null>;
    /**
     * Load template from disk
     */
    private loadFromDisk;
    /**
     * Load template registry for fast lookup
     */
    loadRegistry(): Promise<TemplateRegistry>;
    /**
     * Build template registry by scanning templates directory
     */
    private buildRegistry;
    /**
     * Save registry to disk
     */
    private saveRegistry;
    /**
     * List all available templates
     */
    list(): Promise<TemplateMetadata[]>;
    /**
     * Find templates by topic
     */
    findByTopic(topic: string): Promise<TemplateMetadata[]>;
    /**
     * Find templates by tag
     */
    findByTag(tag: string): Promise<TemplateMetadata[]>;
    /**
     * Search templates by keyword
     */
    search(keyword: string): Promise<TemplateMetadata[]>;
    /**
     * Rebuild registry (useful when templates are added/removed)
     */
    rebuildRegistry(): Promise<TemplateRegistry>;
    /**
     * Clear template cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        templates: string[];
    };
}
//# sourceMappingURL=template-loader.d.ts.map