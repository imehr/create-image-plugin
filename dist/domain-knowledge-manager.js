"use strict";
/**
 * Domain Knowledge Manager
 *
 * Manages domain knowledge (system instructions) for templates:
 * - View domain knowledge
 * - Update domain knowledge from file or inline
 * - Append rules
 *
 * Mirrors the web UI "Illustration Rules" tab functionality
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
exports.DomainKnowledgeManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class DomainKnowledgeManager {
    constructor(repositoryPath) {
        this.templatesDir = path.join(repositoryPath, 'templates');
    }
    /**
     * Get domain knowledge for a template
     */
    getDomainKnowledge(templateName) {
        const templateDir = this.getTemplateDir(templateName);
        const dkPath = path.join(templateDir, 'domain-knowledge.txt');
        if (!fs.existsSync(dkPath)) {
            return null;
        }
        const content = fs.readFileSync(dkPath, 'utf-8');
        return {
            content,
            lineCount: content.split('\n').length,
            sizeBytes: Buffer.byteLength(content, 'utf-8'),
            path: dkPath,
        };
    }
    /**
     * Update domain knowledge from content string
     */
    updateDomainKnowledge(templateName, content) {
        const templateDir = this.getTemplateDir(templateName);
        const dkPath = path.join(templateDir, 'domain-knowledge.txt');
        fs.writeFileSync(dkPath, content, 'utf-8');
        return {
            content,
            lineCount: content.split('\n').length,
            sizeBytes: Buffer.byteLength(content, 'utf-8'),
            path: dkPath,
        };
    }
    /**
     * Update domain knowledge from file
     */
    updateFromFile(templateName, filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return this.updateDomainKnowledge(templateName, content);
    }
    /**
     * Append text to domain knowledge
     */
    appendToDomainKnowledge(templateName, text) {
        const current = this.getDomainKnowledge(templateName);
        const currentContent = current?.content || '';
        // Add newlines if needed
        const separator = currentContent.endsWith('\n') ? '\n' : '\n\n';
        const newContent = currentContent + separator + text + '\n';
        return this.updateDomainKnowledge(templateName, newContent);
    }
    /**
     * Get template directory path
     */
    getTemplateDir(templateName) {
        const templateDir = path.join(this.templatesDir, templateName);
        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template not found: ${templateName}`);
        }
        return templateDir;
    }
}
exports.DomainKnowledgeManager = DomainKnowledgeManager;
//# sourceMappingURL=domain-knowledge-manager.js.map