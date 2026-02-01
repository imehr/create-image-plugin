/**
 * Core type definitions for create-image plugin
 */
export interface PluginContext {
    configDir: string;
    repositoryPath: string;
    cwd: string;
}
export interface ImageGenerationRequest {
    prompt: string;
    template?: string;
    topic?: string;
    style?: string;
    type?: string;
    outputPath?: string;
    provider?: string;
    model?: string;
    styleGridPath?: string;
}
export interface ImageGenerationResult {
    success: boolean;
    path?: string;
    size?: number;
    sizeKB?: string;
    provider?: string;
    model?: string;
    error?: string;
    fallbackUsed?: boolean;
}
export interface ProviderConfig {
    name: string;
    apiKey?: string;
    model?: string;
    project?: string;
    location?: string;
    priority: number;
    enabled: boolean;
}
export interface Template {
    name: string;
    topic: string;
    style: string;
    description: string;
    config: any;
    styleGuide: any;
}
export interface GlobalConfig {
    repositoryPath: string;
    defaultProvider: string;
    providers: ProviderConfig[];
    defaultTemplate?: string;
    autoFallback: boolean;
    cacheEnabled?: boolean;
    cacheTTL?: number;
}
export interface ProviderHealth {
    provider: string;
    healthy: boolean;
    lastChecked: number;
    error?: string;
}
export interface ProviderFallbackChain {
    primary: ProviderConfig;
    fallbacks: ProviderConfig[];
}
export interface TemplateMetadata {
    name: string;
    topic: string;
    style: string;
    description: string;
    path: string;
    version: string;
    tags: string[];
    supportedTypes: string[];
}
export interface TemplateRegistry {
    templates: TemplateMetadata[];
    lastUpdated: string;
    version: string;
}
export interface TemplateCache {
    [key: string]: {
        template: Template;
        loadedAt: number;
    };
}
//# sourceMappingURL=types.d.ts.map