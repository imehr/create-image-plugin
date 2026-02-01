"use strict";
/**
 * Configuration Loader
 *
 * Loads and manages configuration from:
 * - ~/.config/create-image/config.yaml (user global config)
 * - Environment variables
 * - Runtime overrides
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
exports.ConfigLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class ConfigLoader {
    constructor(context) {
        this.context = context;
        this.configPath = path.join(context.configDir, 'config.yaml');
    }
    /**
     * Load configuration from all sources and merge
     */
    async load() {
        // Return cached if available
        if (this.cachedConfig) {
            return this.cachedConfig;
        }
        // Start with defaults
        const config = {
            repositoryPath: this.context.repositoryPath,
            defaultProvider: 'gemini',
            providers: [],
            autoFallback: true,
            cacheEnabled: true,
            cacheTTL: 3600000 // 1 hour
        };
        // Load from YAML file if exists
        if (fs.existsSync(this.configPath)) {
            try {
                const yamlConfig = this.loadYAMLConfig(this.configPath);
                Object.assign(config, yamlConfig);
            }
            catch (error) {
                console.warn(`Failed to load config from ${this.configPath}:`, error);
            }
        }
        // Discover providers from environment variables
        const envProviders = this.discoverProvidersFromEnv();
        config.providers = this.mergeProviders(config.providers, envProviders);
        // Set default provider to first available if not set
        if (config.providers.length > 0 && !config.providers.find(p => p.name === config.defaultProvider)) {
            config.defaultProvider = config.providers[0].name;
        }
        this.cachedConfig = config;
        return config;
    }
    /**
     * Load YAML configuration file
     * Using simple parsing for YAML subset without external dependencies
     */
    loadYAMLConfig(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        // Simple YAML parser for our config structure
        // Supports basic key-value pairs and nested objects
        const config = {};
        const lines = content.split('\n');
        let currentSection = null;
        let currentArray = null;
        let currentKey = null;
        for (const line of lines) {
            const trimmed = line.trim();
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }
            // Handle top-level keys
            if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/)) {
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                if (value) {
                    // Simple key-value
                    config[key] = this.parseValue(value);
                    currentSection = null;
                    currentArray = null;
                    currentKey = null;
                }
                else {
                    // Section start
                    currentKey = key;
                    currentSection = {};
                    config[key] = currentSection;
                    currentArray = null;
                }
            }
            // Handle array items
            else if (trimmed.startsWith('- ')) {
                if (currentKey && !currentArray) {
                    currentArray = [];
                    config[currentKey] = currentArray;
                }
                if (currentArray) {
                    const item = trimmed.substring(2).trim();
                    if (item.includes(':')) {
                        // Object in array
                        const obj = {};
                        const [k, ...v] = item.split(':');
                        obj[k.trim()] = this.parseValue(v.join(':').trim());
                        currentArray.push(obj);
                    }
                    else {
                        currentArray.push(this.parseValue(item));
                    }
                }
            }
            // Handle nested properties
            else if (trimmed.match(/^\s+[a-zA-Z_]/)) {
                const [key, ...valueParts] = trimmed.split(':');
                const value = valueParts.join(':').trim();
                if (currentSection && value) {
                    currentSection[key.trim()] = this.parseValue(value);
                }
            }
        }
        return config;
    }
    /**
     * Parse YAML value to appropriate type
     */
    parseValue(value) {
        const trimmed = value.trim();
        // Boolean
        if (trimmed === 'true')
            return true;
        if (trimmed === 'false')
            return false;
        // Number
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            return Number(trimmed);
        }
        // String (remove quotes if present)
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return trimmed.slice(1, -1);
        }
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            return trimmed.slice(1, -1);
        }
        return trimmed;
    }
    /**
     * Discover available providers from environment variables
     */
    discoverProvidersFromEnv() {
        const providers = [];
        const env = process.env;
        // Gemini
        if (env.GOOGLE_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY) {
            providers.push({
                name: 'gemini',
                apiKey: env.GOOGLE_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY || '',
                model: env.GEMINI_MODEL || 'gemini-3-pro-image-preview',
                priority: 1,
                enabled: true
            });
        }
        // Vertex AI
        if (env.GOOGLE_CLOUD_PROJECT || env.VERTEX_PROJECT) {
            providers.push({
                name: 'vertexai',
                apiKey: '',
                model: env.VERTEX_MODEL || 'gemini-3-pro-image-preview',
                project: env.GOOGLE_CLOUD_PROJECT || env.VERTEX_PROJECT,
                location: env.GOOGLE_CLOUD_LOCATION || env.VERTEX_LOCATION || 'global',
                priority: 2,
                enabled: true
            });
        }
        // OpenRouter
        if (env.OPENROUTER_API_KEY) {
            providers.push({
                name: 'openrouter',
                apiKey: env.OPENROUTER_API_KEY,
                model: env.OPENROUTER_MODEL || 'google/gemini-3-pro-image-preview',
                priority: 3,
                enabled: true
            });
        }
        return providers;
    }
    /**
     * Merge provider configs, preferring explicit config over env
     */
    mergeProviders(configProviders, envProviders) {
        const merged = new Map();
        // Start with env providers
        for (const provider of envProviders) {
            merged.set(provider.name, provider);
        }
        // Override with config providers (they take precedence)
        for (const provider of configProviders) {
            if (merged.has(provider.name)) {
                // Merge, keeping config values but using env API key if not specified
                const envProvider = merged.get(provider.name);
                merged.set(provider.name, {
                    ...envProvider,
                    ...provider,
                    apiKey: provider.apiKey || envProvider.apiKey
                });
            }
            else {
                merged.set(provider.name, provider);
            }
        }
        return Array.from(merged.values()).sort((a, b) => a.priority - b.priority);
    }
    /**
     * Get provider by name
     */
    getProvider(name, config) {
        const cfg = config || this.cachedConfig;
        if (!cfg)
            return undefined;
        return cfg.providers.find(p => p.name === name && p.enabled);
    }
    /**
     * Get all enabled providers sorted by priority
     */
    getEnabledProviders(config) {
        const cfg = config || this.cachedConfig;
        if (!cfg)
            return [];
        return cfg.providers.filter(p => p.enabled).sort((a, b) => a.priority - b.priority);
    }
    /**
     * Reload configuration (clears cache)
     */
    async reload() {
        this.cachedConfig = undefined;
        return this.load();
    }
    /**
     * Create example configuration file
     */
    static createExampleConfig(configDir) {
        const configPath = path.join(configDir, 'config.yaml');
        // Create directory if it doesn't exist
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        const exampleConfig = `# Create-Image Plugin Configuration
# Location: ~/.config/create-image/config.yaml

# Path to image-generator repository
repositoryPath: ${path.join(os.homedir(), 'Documents', 'github', 'image-generator')}

# Default provider to use (gemini, openrouter, vertexai)
defaultProvider: gemini

# Enable automatic fallback to other providers on failure
autoFallback: true

# Enable template caching (faster subsequent loads)
cacheEnabled: true

# Cache TTL in milliseconds (default: 1 hour)
cacheTTL: 3600000

# Default template to use if none specified
# defaultTemplate: sports/illustrative

# Provider configurations (optional - can use environment variables instead)
# providers:
#   - name: gemini
#     apiKey: your_key_here  # Or use GOOGLE_API_KEY env var
#     model: gemini-3-pro-image-preview
#     priority: 1
#     enabled: true
#
#   - name: openrouter
#     apiKey: your_key_here  # Or use OPENROUTER_API_KEY env var
#     model: google/gemini-3-pro-image-preview
#     priority: 3
#     enabled: true
#
#   - name: vertexai
#     project: your_gcp_project_id
#     location: global
#     model: gemini-3-pro-image-preview
#     priority: 2
#     enabled: true

# Notes:
# - API keys from environment variables take precedence
# - Priority determines fallback order (lower = higher priority)
# - Disabled providers will not be used even if configured
`;
        fs.writeFileSync(configPath, exampleConfig, 'utf-8');
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=config-loader.js.map