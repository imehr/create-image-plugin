"use strict";
/**
 * Create-Image Plugin Entry Point
 *
 * Universal AI image generation plugin for Claude Code.
 * Supports templates, style references, domain knowledge,
 * and multi-provider fallback.
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGenerationAvailable = exports.generateStyleReferenceGrid = exports.ActiveTemplateManager = exports.DomainKnowledgeManager = exports.StyleReferenceManager = exports.ProviderManager = exports.TemplateLoader = exports.ConfigLoader = exports.ImageOrchestrator = void 0;
exports.createPlugin = createPlugin;
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const orchestrator_1 = require("./orchestrator");
const style_reference_manager_1 = require("./style-reference-manager");
const domain_knowledge_manager_1 = require("./domain-knowledge-manager");
const active_template_manager_1 = require("./active-template-manager");
// Export types
__exportStar(require("./types"), exports);
// Export core components
var orchestrator_2 = require("./orchestrator");
Object.defineProperty(exports, "ImageOrchestrator", { enumerable: true, get: function () { return orchestrator_2.ImageOrchestrator; } });
var config_loader_1 = require("./config-loader");
Object.defineProperty(exports, "ConfigLoader", { enumerable: true, get: function () { return config_loader_1.ConfigLoader; } });
var template_loader_1 = require("./template-loader");
Object.defineProperty(exports, "TemplateLoader", { enumerable: true, get: function () { return template_loader_1.TemplateLoader; } });
var provider_manager_1 = require("./provider-manager");
Object.defineProperty(exports, "ProviderManager", { enumerable: true, get: function () { return provider_manager_1.ProviderManager; } });
// Export new managers (matching web UI functionality)
var style_reference_manager_2 = require("./style-reference-manager");
Object.defineProperty(exports, "StyleReferenceManager", { enumerable: true, get: function () { return style_reference_manager_2.StyleReferenceManager; } });
var domain_knowledge_manager_2 = require("./domain-knowledge-manager");
Object.defineProperty(exports, "DomainKnowledgeManager", { enumerable: true, get: function () { return domain_knowledge_manager_2.DomainKnowledgeManager; } });
var active_template_manager_2 = require("./active-template-manager");
Object.defineProperty(exports, "ActiveTemplateManager", { enumerable: true, get: function () { return active_template_manager_2.ActiveTemplateManager; } });
// Export Nano Banana Pro generator
var nano_banana_generator_1 = require("./nano-banana-generator");
Object.defineProperty(exports, "generateStyleReferenceGrid", { enumerable: true, get: function () { return nano_banana_generator_1.generateStyleReferenceGrid; } });
Object.defineProperty(exports, "isGenerationAvailable", { enumerable: true, get: function () { return nano_banana_generator_1.isGenerationAvailable; } });
/**
 * Create and initialize the create-image plugin
 */
async function createPlugin(cwd = process.cwd()) {
    const repositoryPath = path.join(os.homedir(), 'Documents', 'github', 'image-generator');
    const context = {
        configDir: path.join(os.homedir(), '.config', 'create-image'),
        repositoryPath,
        cwd
    };
    const orchestrator = new orchestrator_1.ImageOrchestrator(context);
    const styleRefManager = new style_reference_manager_1.StyleReferenceManager(repositoryPath);
    const domainKnowledgeManager = new domain_knowledge_manager_1.DomainKnowledgeManager(repositoryPath);
    const activeTemplateManager = new active_template_manager_1.ActiveTemplateManager(repositoryPath);
    return {
        name: 'create-image',
        version: '2.0.0',
        orchestrator,
        styleRefManager,
        domainKnowledgeManager,
        activeTemplateManager,
        async generate(request) {
            return orchestrator.generateImage(request);
        },
        async listTemplates() {
            return orchestrator.listTemplates();
        },
        // Style reference management
        listStyleReferences(templateName) {
            return styleRefManager.listStyleReferences(templateName);
        },
        setActiveReference(templateName, filename) {
            return styleRefManager.setActiveReference(templateName, filename);
        },
        getActiveReference(templateName) {
            return styleRefManager.getActiveReference(templateName);
        },
        // Domain knowledge management
        getDomainKnowledge(templateName) {
            return domainKnowledgeManager.getDomainKnowledge(templateName);
        },
        updateDomainKnowledge(templateName, content) {
            return domainKnowledgeManager.updateDomainKnowledge(templateName, content);
        },
        // Active template management
        getActiveTemplate() {
            return activeTemplateManager.getActiveTemplate();
        },
        setActiveTemplate(templateName) {
            return activeTemplateManager.setActiveTemplate(templateName);
        }
    };
}
exports.default = createPlugin;
//# sourceMappingURL=index.js.map