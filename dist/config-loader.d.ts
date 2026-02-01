/**
 * Configuration Loader
 *
 * Loads and manages configuration from:
 * - ~/.config/create-image/config.yaml (user global config)
 * - Environment variables
 * - Runtime overrides
 */
import { GlobalConfig, ProviderConfig, PluginContext } from './types';
export declare class ConfigLoader {
    private context;
    private configPath;
    private cachedConfig?;
    constructor(context: PluginContext);
    /**
     * Load configuration from all sources and merge
     */
    load(): Promise<GlobalConfig>;
    /**
     * Load YAML configuration file
     * Using simple parsing for YAML subset without external dependencies
     */
    private loadYAMLConfig;
    /**
     * Parse YAML value to appropriate type
     */
    private parseValue;
    /**
     * Discover available providers from environment variables
     */
    private discoverProvidersFromEnv;
    /**
     * Merge provider configs, preferring explicit config over env
     */
    private mergeProviders;
    /**
     * Get provider by name
     */
    getProvider(name: string, config?: GlobalConfig): ProviderConfig | undefined;
    /**
     * Get all enabled providers sorted by priority
     */
    getEnabledProviders(config?: GlobalConfig): ProviderConfig[];
    /**
     * Reload configuration (clears cache)
     */
    reload(): Promise<GlobalConfig>;
    /**
     * Create example configuration file
     */
    static createExampleConfig(configDir: string): void;
}
//# sourceMappingURL=config-loader.d.ts.map