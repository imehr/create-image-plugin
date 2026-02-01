/**
 * Provider Manager
 *
 * Manages provider selection and automatic fallback:
 * - Automatic fallback chain (Gemini → OpenRouter → VertexAI)
 * - Provider health checking
 * - Load balancing (future)
 * - Comprehensive error handling
 */

import { spawn } from 'child_process';
import * as path from 'path';
import {
  ProviderConfig,
  ProviderHealth,
  ProviderFallbackChain,
  ImageGenerationRequest,
  ImageGenerationResult,
  GlobalConfig
} from './types';

export class ProviderManager {
  private repositoryPath: string;
  private healthCache: Map<string, ProviderHealth>;
  private healthCheckTTL: number = 300000; // 5 minutes

  constructor(repositoryPath: string) {
    this.repositoryPath = repositoryPath;
    this.healthCache = new Map();
  }

  /**
   * Generate image with automatic provider fallback
   */
  async generateWithFallback(
    request: ImageGenerationRequest,
    config: GlobalConfig
  ): Promise<ImageGenerationResult> {
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
  private async tryProvider(
    provider: ProviderConfig,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
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
      } else if (provider.name === 'openrouter') {
        env.OPENROUTER_API_KEY = provider.apiKey || '';
      } else if (provider.name === 'vertexai') {
        env.GOOGLE_CLOUD_PROJECT = provider.project || env.GOOGLE_CLOUD_PROJECT || '';
        env.GOOGLE_CLOUD_LOCATION = provider.location || env.GOOGLE_CLOUD_LOCATION || 'global';
        env.GOOGLE_GENAI_USE_VERTEXAI = 'true';
      }

      const nodeProcess = spawn('node', args, {
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
        } else {
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
  private buildFallbackChain(
    request: ImageGenerationRequest,
    config: GlobalConfig
  ): ProviderFallbackChain {
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
  async checkHealth(provider: ProviderConfig): Promise<ProviderHealth> {
    // Check cache first
    const cached = this.healthCache.get(provider.name);
    if (cached && Date.now() - cached.lastChecked < this.healthCheckTTL) {
      return cached;
    }

    // Perform health check
    const health: ProviderHealth = {
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
    } else if (!provider.apiKey || provider.apiKey.length === 0) {
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
  async refreshHealth(providerName: string, config: GlobalConfig): Promise<ProviderHealth | null> {
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
  async getHealthStatus(config: GlobalConfig): Promise<ProviderHealth[]> {
    const results: ProviderHealth[] = [];

    for (const provider of config.providers) {
      const health = await this.checkHealth(provider);
      results.push(health);
    }

    return results;
  }

  /**
   * Select best available provider based on health and priority
   */
  async selectBestProvider(config: GlobalConfig): Promise<ProviderConfig | null> {
    const healthStatuses = await this.getHealthStatus(config);
    const healthyProviders = healthStatuses
      .filter(h => h.healthy)
      .map(h => config.providers.find(p => p.name === h.provider)!)
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority);

    return healthyProviders.length > 0 ? healthyProviders[0] : null;
  }

  /**
   * Clear health cache
   */
  clearHealthCache(): void {
    this.healthCache.clear();
    console.log('[ProviderManager] Health cache cleared');
  }
}
