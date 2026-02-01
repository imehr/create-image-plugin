/**
 * Image Generation Orchestrator (Enhanced)
 *
 * Coordinates:
 * - Configuration loading (ConfigLoader)
 * - Template loading with caching (TemplateLoader)
 * - Provider selection with fallback (ProviderManager)
 * - CLI execution and result handling
 */
import { PluginContext, ImageGenerationRequest, ImageGenerationResult } from './types';
export declare class ImageOrchestrator {
    private context;
    private configLoader;
    private templateLoader?;
    private providerManager?;
    private config?;
    constructor(context: PluginContext);
    /**
     * Initialize orchestrator (load config and setup components)
     */
    initialize(): Promise<void>;
    /**
     * Ensure orchestrator is initialized
     */
    private ensureInitialized;
    /**
     * Generate an image with automatic provider fallback
     */
    generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
    /**
     * List available templates
     */
    listTemplates(): Promise<string>;
    /**
     * Get provider health status
     */
    getProviderHealth(): Promise<string>;
    /**
     * Search templates by keyword
     */
    searchTemplates(keyword: string): Promise<string>;
    /**
     * Rebuild template registry
     */
    rebuildRegistry(): Promise<string>;
    /**
     * Get cache statistics
     */
    getCacheStats(): string;
    /**
     * Clear all caches
     */
    clearCaches(): string;
    /**
     * Reload configuration
     */
    reloadConfig(): Promise<string>;
    /**
     * Get current configuration summary
     */
    getConfigSummary(): string;
}
//# sourceMappingURL=orchestrator.d.ts.map