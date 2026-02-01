"use strict";
/**
 * Template Loader
 *
 * Fast template loading with:
 * - Registry-based lookup (templates/registry.json)
 * - In-memory caching
 * - Template metadata extraction
 * - Style guide and prompt merging
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
exports.TemplateLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TemplateLoader {
    constructor(repositoryPath, cacheTTL = 3600000) {
        this.repositoryPath = repositoryPath;
        this.templatesDir = path.join(repositoryPath, 'templates');
        this.registryPath = path.join(this.templatesDir, 'registry.json');
        this.cache = {};
        this.cacheTTL = cacheTTL;
    }
    /**
     * Load a template by name (topic/style format)
     */
    async load(templateName) {
        // Check cache first
        const cached = this.cache[templateName];
        if (cached && Date.now() - cached.loadedAt < this.cacheTTL) {
            console.log(`[TemplateLoader] Cache hit: ${templateName}`);
            return cached.template;
        }
        // Load from disk
        const template = await this.loadFromDisk(templateName);
        if (!template) {
            return null;
        }
        // Update cache
        this.cache[templateName] = {
            template,
            loadedAt: Date.now()
        };
        return template;
    }
    /**
     * Load template from disk
     */
    async loadFromDisk(templateName) {
        const templateDir = path.join(this.templatesDir, templateName);
        if (!fs.existsSync(templateDir)) {
            console.warn(`[TemplateLoader] Template not found: ${templateName}`);
            return null;
        }
        try {
            // Load config.json
            const configPath = path.join(templateDir, 'config.json');
            const config = fs.existsSync(configPath)
                ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
                : {};
            // Load style-guide.json
            const styleGuidePath = path.join(templateDir, 'style-guide.json');
            const styleGuide = fs.existsSync(styleGuidePath)
                ? JSON.parse(fs.readFileSync(styleGuidePath, 'utf-8'))
                : {};
            // Load domain-knowledge.txt
            const domainKnowledgePath = path.join(templateDir, 'domain-knowledge.txt');
            const domainKnowledge = fs.existsSync(domainKnowledgePath)
                ? fs.readFileSync(domainKnowledgePath, 'utf-8')
                : '';
            // Find style reference grid
            const styleRefDir = path.join(templateDir, 'style-references');
            let styleGridPath;
            if (fs.existsSync(styleRefDir)) {
                const files = fs.readdirSync(styleRefDir);
                const gridFile = files.find(f => f.includes('grid') && f.endsWith('.png'));
                if (gridFile) {
                    styleGridPath = path.join(styleRefDir, gridFile);
                }
            }
            // Load prompt templates
            const promptsDir = path.join(templateDir, 'prompts');
            const prompts = {};
            if (fs.existsSync(promptsDir)) {
                const promptFiles = fs.readdirSync(promptsDir);
                for (const file of promptFiles) {
                    if (file.endsWith('.txt')) {
                        const type = path.basename(file, '.txt');
                        prompts[type] = fs.readFileSync(path.join(promptsDir, file), 'utf-8');
                    }
                }
            }
            const template = {
                name: config.name || templateName.replace('/', '-'),
                topic: config.topic || templateName.split('/')[0],
                style: config.style || templateName.split('/')[1] || 'default',
                description: config.description || '',
                config: {
                    ...config,
                    domainKnowledge,
                    prompts,
                    styleGridPath
                },
                styleGuide
            };
            console.log(`[TemplateLoader] Loaded: ${templateName}`);
            return template;
        }
        catch (error) {
            console.error(`[TemplateLoader] Error loading ${templateName}:`, error);
            return null;
        }
    }
    /**
     * Load template registry for fast lookup
     */
    async loadRegistry() {
        if (this.registry) {
            return this.registry;
        }
        // Try to load existing registry
        if (fs.existsSync(this.registryPath)) {
            try {
                const loaded = JSON.parse(fs.readFileSync(this.registryPath, 'utf-8'));
                this.registry = loaded;
                return this.registry;
            }
            catch (error) {
                console.warn('[TemplateLoader] Failed to load registry, rebuilding...');
            }
        }
        // Build registry by scanning templates directory
        this.registry = await this.buildRegistry();
        this.saveRegistry(this.registry);
        return this.registry;
    }
    /**
     * Build template registry by scanning templates directory
     */
    async buildRegistry() {
        const templates = [];
        if (!fs.existsSync(this.templatesDir)) {
            return {
                templates: [],
                lastUpdated: new Date().toISOString(),
                version: '1.0.0'
            };
        }
        // Scan topics (first level directories)
        const topics = fs.readdirSync(this.templatesDir).filter(item => {
            const itemPath = path.join(this.templatesDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        for (const topic of topics) {
            const topicDir = path.join(this.templatesDir, topic);
            // Scan styles (second level directories)
            const styles = fs.readdirSync(topicDir).filter(item => {
                const itemPath = path.join(topicDir, item);
                return fs.statSync(itemPath).isDirectory();
            });
            for (const style of styles) {
                const templateDir = path.join(topicDir, style);
                const configPath = path.join(templateDir, 'config.json');
                if (!fs.existsSync(configPath)) {
                    console.warn(`[TemplateLoader] No config.json in ${topic}/${style}, skipping`);
                    continue;
                }
                try {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                    templates.push({
                        name: `${topic}/${style}`,
                        topic,
                        style,
                        description: config.description || '',
                        path: templateDir,
                        version: config.version || '1.0.0',
                        tags: config.tags || [],
                        supportedTypes: config.supported_types || []
                    });
                }
                catch (error) {
                    console.error(`[TemplateLoader] Error reading ${topic}/${style}:`, error);
                }
            }
        }
        return {
            templates,
            lastUpdated: new Date().toISOString(),
            version: '1.0.0'
        };
    }
    /**
     * Save registry to disk
     */
    saveRegistry(registry) {
        try {
            fs.writeFileSync(this.registryPath, JSON.stringify(registry, null, 2), 'utf-8');
            console.log(`[TemplateLoader] Registry saved: ${registry.templates.length} templates`);
        }
        catch (error) {
            console.error('[TemplateLoader] Failed to save registry:', error);
        }
    }
    /**
     * List all available templates
     */
    async list() {
        const registry = await this.loadRegistry();
        return registry.templates;
    }
    /**
     * Find templates by topic
     */
    async findByTopic(topic) {
        const registry = await this.loadRegistry();
        return registry.templates.filter(t => t.topic === topic);
    }
    /**
     * Find templates by tag
     */
    async findByTag(tag) {
        const registry = await this.loadRegistry();
        return registry.templates.filter(t => t.tags.includes(tag));
    }
    /**
     * Search templates by keyword
     */
    async search(keyword) {
        const registry = await this.loadRegistry();
        const lowerKeyword = keyword.toLowerCase();
        return registry.templates.filter(t => t.name.toLowerCase().includes(lowerKeyword) ||
            t.description.toLowerCase().includes(lowerKeyword) ||
            t.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)));
    }
    /**
     * Rebuild registry (useful when templates are added/removed)
     */
    async rebuildRegistry() {
        this.registry = undefined;
        this.registry = await this.buildRegistry();
        this.saveRegistry(this.registry);
        return this.registry;
    }
    /**
     * Clear template cache
     */
    clearCache() {
        this.cache = {};
        console.log('[TemplateLoader] Cache cleared');
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: Object.keys(this.cache).length,
            templates: Object.keys(this.cache)
        };
    }
}
exports.TemplateLoader = TemplateLoader;
//# sourceMappingURL=template-loader.js.map