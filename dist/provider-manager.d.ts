/**
 * Provider Manager
 *
 * Manages provider selection and automatic fallback:
 * - Automatic fallback chain (Gemini → OpenRouter → VertexAI)
 * - Provider health checking
 * - Load balancing (future)
 * - Comprehensive error handling
 */
import { ProviderConfig, ProviderHealth, ImageGenerationRequest, ImageGenerationResult, GlobalConfig } from './types';
export declare class ProviderManager {
    private repositoryPath;
    private healthCache;
    private healthCheckTTL;
    constructor(repositoryPath: string);
    /**
     * Generate image with automatic provider fallback
     */
    generateWithFallback(request: ImageGenerationRequest, config: GlobalConfig): Promise<ImageGenerationResult>;
    /**
     * Try a specific provider
     */
    private tryProvider;
    /**
     * Build fallback chain for a request
     */
    private buildFallbackChain;
    /**
     * Check provider health
     */
    checkHealth(provider: ProviderConfig): Promise<ProviderHealth>;
    /**
     * Force refresh health for a provider
     */
    refreshHealth(providerName: string, config: GlobalConfig): Promise<ProviderHealth | null>;
    /**
     * Get health status for all providers
     */
    getHealthStatus(config: GlobalConfig): Promise<ProviderHealth[]>;
    /**
     * Select best available provider based on health and priority
     */
    selectBestProvider(config: GlobalConfig): Promise<ProviderConfig | null>;
    /**
     * Clear health cache
     */
    clearHealthCache(): void;
}
//# sourceMappingURL=provider-manager.d.ts.map