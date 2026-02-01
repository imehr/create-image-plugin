"use strict";
/**
 * Active Template Manager
 *
 * Manages which template is currently active for image generation.
 * Mirrors the web UI active template selection.
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
exports.ActiveTemplateManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ActiveTemplateManager {
    constructor(repositoryPath) {
        this.templatesDir = path.join(repositoryPath, 'templates');
        this.activeStylePath = path.join(this.templatesDir, '.active-style');
    }
    /**
     * Get the currently active template name
     */
    getActiveTemplate() {
        if (fs.existsSync(this.activeStylePath)) {
            const content = fs.readFileSync(this.activeStylePath, 'utf-8').trim();
            if (content)
                return content;
        }
        return 'sports/illustrative'; // Default
    }
    /**
     * Set the active template
     */
    setActiveTemplate(templateName) {
        const templateDir = path.join(this.templatesDir, templateName);
        if (!fs.existsSync(templateDir)) {
            throw new Error(`Template not found: ${templateName}`);
        }
        fs.writeFileSync(this.activeStylePath, templateName, 'utf-8');
    }
    /**
     * Check if a template is the active one
     */
    isActive(templateName) {
        return this.getActiveTemplate() === templateName;
    }
    /**
     * Get full path to active template directory
     */
    getActiveTemplateDir() {
        return path.join(this.templatesDir, this.getActiveTemplate());
    }
}
exports.ActiveTemplateManager = ActiveTemplateManager;
//# sourceMappingURL=active-template-manager.js.map