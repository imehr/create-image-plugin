"use strict";
/**
 * Provider Manager
 *
 * Manages provider selection and automatic fallback:
 * - Automatic fallback chain (Gemini → OpenRouter → VertexAI)
 * - Provider health checking
 * - Load balancing (future)
 * - Comprehensive error handling
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderManager = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
class ProviderManager {
    constructor(repositoryPath) {
        this.healthCheckTTL = 300000; // 5 minutes
        this.repositoryPath = repositoryPath;
        this.healthCache = new Map();
    }
    /**
     * Generate image with automatic provider fallback
     */
    async generateWithFallback(request, config) {
        const fallbackChain = this.buildFallbackChain(request, config);
        console.log(`[ProviderManager] Fallback chain: ${fallbackChain.primary.name} → ${fallbackChain.fallbacks.map(p => p.name).join(' → ')}`);
        // Try primary provider
        let result = await this.tryProvider(fallbackChain.primary, request);
        if (result.success) {
            return result;
        }
        // Try fallback providers
        if (config.autoFallback && fallbackChain.fallbacks.length > 0) {
            console.log(`[ProviderManager] Primary provider failed, trying fallbacks...`);
            for (const provider of fallbackChain.fallbacks) {
                console.log(`[ProviderManager] Trying fallback: ${provider.name}`);
                result = await this.tryProvider(provider, request);
                if (result.success) {
                    result.fallbackUsed = true;
                    return result;
                }
            }
        }
        // All providers failed
        return {
            success: false,
            error: `All providers failed. Last error: ${result.error}`
        };
    }
    /**
     * Try a specific provider
     */
    async tryProvider(provider, request) {
        console.log(`[ProviderManager] Attempting generation with ${provider.name}`);
        // Check provider health first
        const health = await this.checkHealth(provider);
        if (!health.healthy) {
            return {
                success: false,
                error: `Provider ${provider.name} is unhealthy: ${health.error}`,
                provider: provider.name
            };
        }
        // Execute generation via Node.js CLI
        const scriptPath = path.join(this.repositoryPath, 'scripts', 'generate.js');
        const args = [scriptPath];
        // Add provider and model
        args.push('--provider', provider.name);
        if (provider.model) {
            args.push('--model', provider.model);
        }
        // Add template if specified
        if (request.template) {
            args.push('--template', request.template);
        }
        // Add type if specified
        if (request.type) {
            args.push('--type', request.type);
        }
        // Add prompt
        args.push('--prompt', request.prompt);
        // Add output path
        const outputPath = request.outputPath || `image_${Date.now()}.png`;
        args.push('--output', outputPath);
        // Add style grid if specified
        if (request.styleGridPath) {
            args.push('--style-grid', request.styleGridPath);
        }
        // Execute
        return new Promise((resolve) => {
            const env = {
                ...process.env
            };
            // Set API key in environment
            if (provider.name === 'gemini') {
                env.GOOGLE_API_KEY = provider.apiKey || '';
            }
            else if (provider.name === 'openrouter') {
                env.OPENROUTER_API_KEY = provider.apiKey || '';
            }
            else if (provider.name === 'vertexai') {
                env.GOOGLE_CLOUD_PROJECT = provider.project || env.GOOGLE_CLOUD_PROJECT || '';
                env.GOOGLE_CLOUD_LOCATION = provider.location || env.GOOGLE_CLOUD_LOCATION || 'global';
                env.GOOGLE_GENAI_USE_VERTEXAI = 'true';
            }
            const nodeProcess = (0, child_process_1.spawn)('node', args, {
                cwd: this.repositoryPath,
                env
            });
            let stdout = '';
            let stderr = '';
            nodeProcess.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                process.stdout.write(output);
            });
            nodeProcess.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                process.stderr.write(output);
            });
            nodeProcess.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        success: true,
                        path: outputPath,
                        provider: provider.name,
                        model: provider.model
                    });
                }
                else {
                    resolve({
                        success: false,
                        error: stderr || stdout || `Process exited with code ${code}`,
                        provider: provider.name
                    });
                }
            });
            nodeProcess.on('error', (error) => {
                resolve({
                    success: false,
                    error: `Failed to spawn process: ${error.message}`,
                    provider: provider.name
                });
            });
        });
    }
    /**
     * Build fallback chain for a request
     */
    buildFallbackChain(request, config) {
        const enabledProviders = config.providers
            .filter(p => p.enabled)
            .sort((a, b) => a.priority - b.priority);
        // If provider specified in request, use it as primary
        if (request.provider) {
            const requestedProvider = enabledProviders.find(p => p.name === request.provider);
            if (requestedProvider) {
                // Override model if specified
                if (request.model) {
                    requestedProvider.model = request.model;
                }
                return {
                    primary: requestedProvider,
                    fallbacks: enabledProviders.filter(p => p.name !== request.provider)
                };
            }
        }
        // Use default provider as primary
        const defaultProvider = enabledProviders.find(p => p.name === config.defaultProvider);
        const primary = defaultProvider || enabledProviders[0];
        return {
            primary,
            fallbacks: enabledProviders.filter(p => p.name !== primary.name)
        };
    }
    /**
     * Check provider health
     */
    async checkHealth(provider) {
        // Check cache first
        const cached = this.healthCache.get(provider.name);
        if (cached && Date.now() - cached.lastChecked < this.healthCheckTTL) {
            return cached;
        }
        // Perform health check
        const health = {
            provider: provider.name,
            healthy: true,
            lastChecked: Date.now()
        };
        // Basic validation: check if API key is present
        if (provider.name === 'vertexai') {
            if (!provider.project && !process.env.GOOGLE_CLOUD_PROJECT) {
                health.healthy = false;
                health.error = 'GOOGLE_CLOUD_PROJECT not configured';
            }
        }
        else if (!provider.apiKey || provider.apiKey.length === 0) {
            health.healthy = false;
            health.error = 'API key not configured';
        }
        // Future: Add actual API health checks here
        // For now, just validate configuration
        // Update cache
        this.healthCache.set(provider.name, health);
        return health;
    }
    /**
     * Force refresh health for a provider
     */
    async refreshHealth(providerName, config) {
        const provider = config.providers.find(p => p.name === providerName);
        if (!provider) {
            return null;
        }
        // Clear cache for this provider
        this.healthCache.delete(providerName);
        // Re-check
        return this.checkHealth(provider);
    }
    /**
     * Get health status for all providers
     */
    async getHealthStatus(config) {
        const results = [];
        for (const provider of config.providers) {
            const health = await this.checkHealth(provider);
            results.push(health);
        }
        return results;
    }
    /**
     * Select best available provider based on health and priority
     */
    async selectBestProvider(config) {
        const healthStatuses = await this.getHealthStatus(config);
        const healthyProviders = healthStatuses
            .filter(h => h.healthy)
            .map(h => config.providers.find(p => p.name === h.provider))
            .filter(p => p.enabled)
            .sort((a, b) => a.priority - b.priority);
        return healthyProviders.length > 0 ? healthyProviders[0] : null;
    }
    /**
     * Clear health cache
     */
    clearHealthCache() {
        this.healthCache.clear();
        console.log('[ProviderManager] Health cache cleared');
    }
}
exports.ProviderManager = ProviderManager;
//# sourceMappingURL=provider-manager.js.map