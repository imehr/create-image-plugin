/**
 * Image Generation Orchestrator (Enhanced)
 *
 * Coordinates:
 * - Configuration loading (ConfigLoader)
 * - Template loading with caching (TemplateLoader)
 * - Provider selection with fallback (ProviderManager)
 * - CLI execution and result handling
 */

import * as path from 'path';
import * as fs from 'fs';
import {
  PluginContext,
  ImageGenerationRequest,
  ImageGenerationResult,
  GlobalConfig
} from './types';
import { ConfigLoader } from './config-loader';
import { TemplateLoader } from './template-loader';
import { ProviderManager } from './provider-manager';

export class ImageOrchestrator {
  private context: PluginContext;
  private configLoader: ConfigLoader;
  private templateLoader?: TemplateLoader;
  private providerManager?: ProviderManager;
  private config?: GlobalConfig;

  constructor(context: PluginContext) {
    this.context = context;
    this.configLoader = new ConfigLoader(context);
  }

  /**
   * Initialize orchestrator (load config and setup components)
   */
  async initialize(): Promise<void> {
    console.log('[Orchestrator] Initializing...');

    // Load configuration
    this.config = await this.configLoader.load();
    console.log(`[Orchestrator] Loaded config: ${this.config.providers.length} providers available`);

    // Initialize template loader
    this.templateLoader = new TemplateLoader(
      this.config.repositoryPath,
      this.config.cacheTTL
    );

    // Initialize provider manager
    this.providerManager = new ProviderManager(this.config.repositoryPath);

    // Load template registry
    await this.templateLoader.loadRegistry();
    console.log('[Orchestrator] Initialization complete');
  }

  /**
   * Ensure orchestrator is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.config || !this.templateLoader || !this.providerManager) {
      await this.initialize();
    }
  }

  /**
   * Generate an image with automatic provider fallback
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    await this.ensureInitialized();

    console.log(`[Orchestrator] Starting image generation`);
    console.log(`  Prompt: ${request.prompt.substring(0, 50)}...`);
    console.log(`  Template: ${request.template || 'none'}`);
    console.log(`  Provider: ${request.provider || 'auto'}`);

    // Load template if specified
    if (request.template && this.templateLoader) {
      const template = await this.templateLoader.load(request.template);
      if (!template) {
        return {
          success: false,
          error: `Template not found: ${request.template}`
        };
      }

      // Add style grid path if available
      if (template.config.styleGridPath && !request.styleGridPath) {
        request.styleGridPath = template.config.styleGridPath;
      }
    }

    // Generate with provider fallback
    if (!this.providerManager || !this.config) {
      return {
        success: false,
        error: 'Orchestrator not initialized'
      };
    }

    const result = await this.providerManager.generateWithFallback(request, this.config);

    // Add file stats if successful
    if (result.success && result.path && fs.existsSync(result.path)) {
      const stats = fs.statSync(result.path);
      result.size = stats.size;
      result.sizeKB = (stats.size / 1024).toFixed(1);
    }

    return result;
  }

  /**
   * List available templates
   */
  async listTemplates(): Promise<string> {
    await this.ensureInitialized();

    if (!this.templateLoader) {
      return 'Template loader not initialized';
    }

    const templates = await this.templateLoader.list();

    if (templates.length === 0) {
      return 'No templates found';
    }

    // Format templates as string
    let output = `Available Templates (${templates.length}):\n\n`;

    for (const template of templates) {
      output += `${template.name}\n`;
      output += `  Topic: ${template.topic}\n`;
      output += `  Style: ${template.style}\n`;
      output += `  Description: ${template.description}\n`;

      if (template.supportedTypes.length > 0) {
        output += `  Types: ${template.supportedTypes.join(', ')}\n`;
      }

      if (template.tags.length > 0) {
        output += `  Tags: ${template.tags.join(', ')}\n`;
      }

      output += '\n';
    }

    return output;
  }

  /**
   * Get provider health status
   */
  async getProviderHealth(): Promise<string> {
    await this.ensureInitialized();

    if (!this.providerManager || !this.config) {
      return 'Provider manager not initialized';
    }

    const healthStatuses = await this.providerManager.getHealthStatus(this.config);

    let output = `Provider Health Status:\n\n`;

    for (const health of healthStatuses) {
      const status = health.healthy ? '✅' : '❌';
      output += `${status} ${health.provider}`;

      if (!health.healthy && health.error) {
        output += ` - ${health.error}`;
      }

      output += '\n';
    }

    return output;
  }

  /**
   * Search templates by keyword
   */
  async searchTemplates(keyword: string): Promise<string> {
    await this.ensureInitialized();

    if (!this.templateLoader) {
      return 'Template loader not initialized';
    }

    const templates = await this.templateLoader.search(keyword);

    if (templates.length === 0) {
      return `No templates found matching: ${keyword}`;
    }

    let output = `Templates matching "${keyword}" (${templates.length}):\n\n`;

    for (const template of templates) {
      output += `${template.name}\n`;
      output += `  Description: ${template.description}\n\n`;
    }

    return output;
  }

  /**
   * Rebuild template registry
   */
  async rebuildRegistry(): Promise<string> {
    await this.ensureInitialized();

    if (!this.templateLoader) {
      return 'Template loader not initialized';
    }

    const registry = await this.templateLoader.rebuildRegistry();
    return `Registry rebuilt: ${registry.templates.length} templates found`;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): string {
    if (!this.templateLoader) {
      return 'Template loader not initialized';
    }

    const stats = this.templateLoader.getCacheStats();
    return `Template Cache: ${stats.size} templates cached\n${stats.templates.join('\n')}`;
  }

  /**
   * Clear all caches
   */
  clearCaches(): string {
    if (!this.templateLoader || !this.providerManager) {
      return 'Components not initialized';
    }

    this.templateLoader.clearCache();
    this.providerManager.clearHealthCache();
    return 'All caches cleared';
  }

  /**
   * Reload configuration
   */
  async reloadConfig(): Promise<string> {
    this.config = await this.configLoader.reload();

    // Re-initialize components with new config
    if (this.config) {
      this.templateLoader = new TemplateLoader(
        this.config.repositoryPath,
        this.config.cacheTTL
      );
      this.providerManager = new ProviderManager(this.config.repositoryPath);
      await this.templateLoader.loadRegistry();
    }

    return `Configuration reloaded: ${this.config?.providers.length} providers configured`;
  }

  /**
   * Get current configuration summary
   */
  getConfigSummary(): string {
    if (!this.config) {
      return 'Configuration not loaded';
    }

    let output = 'Current Configuration:\n\n';
    output += `Repository: ${this.config.repositoryPath}\n`;
    output += `Default Provider: ${this.config.defaultProvider}\n`;
    output += `Auto Fallback: ${this.config.autoFallback ? 'enabled' : 'disabled'}\n`;
    output += `Cache Enabled: ${this.config.cacheEnabled ? 'yes' : 'no'}\n`;
    output += `Cache TTL: ${this.config.cacheTTL}ms\n\n`;

    output += `Providers (${this.config.providers.length}):\n`;
    for (const provider of this.config.providers) {
      const status = provider.enabled ? '✅' : '⛔';
      output += `${status} ${provider.name} (priority: ${provider.priority})\n`;
      output += `   Model: ${provider.model || 'default'}\n`;
      output += `   API Key: ${provider.apiKey ? '***' + provider.apiKey.slice(-4) : 'not set'}\n`;
    }

    return output;
  }
}
