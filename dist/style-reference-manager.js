"use strict";
/**
 * Style Reference Manager
 *
 * Manages style reference images for templates:
 * - List style references for a template
 * - Set active style reference
 * - Generate new style references with Nano Banana Pro
 *
 * Mirrors the web UI functionality at /illustrations
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
exports.StyleReferenceManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const nano_banana_generator_1 = require("./nano-banana-generator");
class StyleReferenceManager {
    constructor(repositoryPath) {
        this.templatesDir = path.join(repositoryPath, 'templates');
    }
    /**
     * Get the active style reference filename for a template
     */
    getActiveReference(templateName) {
        const templateDir = this.getTemplateDir(templateName);
        const prefsPath = path.join(templateDir, '.active-reference');
        if (fs.existsSync(prefsPath)) {
            return fs.readFileSync(prefsPath, 'utf-8').trim() || null;
        }
        return null;
    }
    /**
     * Set the active style reference for a template
     */
    setActiveReference(templateName, filename) {
        const templateDir = this.getTemplateDir(templateName);
        const refsDir = path.join(templateDir, 'style-references');
        const fullPath = path.join(refsDir, filename);
        // Verify the file exists
        if (!fs.existsSync(fullPath)) {
            // Try adding .png extension
            const withPng = filename.endsWith('.png') ? filename : `${filename}.png`;
            if (fs.existsSync(path.join(refsDir, withPng))) {
                filename = withPng;
            }
            else {
                throw new Error(`Style reference not found: ${filename}`);
            }
        }
        fs.writeFileSync(path.join(templateDir, '.active-reference'), filename, 'utf-8');
    }
    /**
     * List all style references for a template
     */
    listStyleReferences(templateName) {
        const templateDir = this.getTemplateDir(templateName);
        const refsDir = path.join(templateDir, 'style-references');
        const activeRef = this.getActiveReference(templateName);
        const references = [];
        if (!fs.existsSync(refsDir)) {
            return references;
        }
        const files = fs.readdirSync(refsDir).filter(f => /\.(png|jpe?g)$/i.test(f));
        for (const file of files) {
            const filePath = path.join(refsDir, file);
            const stat = fs.statSync(filePath);
            references.push({
                name: path.basename(file, path.extname(file)),
                filename: file,
                path: filePath,
                sizeKB: Math.round(stat.size / 1024),
                isActive: file === activeRef,
            });
        }
        return references;
    }
    /**
     * Get the full path to the active style reference image
     */
    getActiveReferencePath(templateName) {
        const activeRef = this.getActiveReference(templateName);
        if (!activeRef)
            return null;
        const templateDir = this.getTemplateDir(templateName);
        const refPath = path.join(templateDir, 'style-references', activeRef);
        return fs.existsSync(refPath) ? refPath : null;
    }
    /**
     * Load the active style reference as base64
     */
    loadActiveReferenceBase64(templateName) {
        const refPath = this.getActiveReferencePath(templateName);
        if (!refPath)
            return null;
        try {
            return fs.readFileSync(refPath).toString('base64');
        }
        catch {
            return null;
        }
    }
    /**
     * Check if Nano Banana Pro generation is available
     */
    checkGenerationAvailability() {
        return (0, nano_banana_generator_1.isGenerationAvailable)();
    }
    /**
     * Generate a new style reference grid using Nano Banana Pro
     */
    async generateStyleReference(templateName, options) {
        // Check if generation is available
        const availability = (0, nano_banana_generator_1.isGenerationAvailable)();
        if (!availability.available) {
            return { success: false, error: availability.reason };
        }
        const templateDir = this.getTemplateDir(templateName);
        const refsDir = path.join(templateDir, 'style-references');
        // Ensure directory exists
        if (!fs.existsSync(refsDir)) {
            fs.mkdirSync(refsDir, { recursive: true });
        }
        // Load existing reference image if specified
        let referenceImageBase64;
        if (options.refImages && options.refImages.length > 0) {
            const refPath = options.refImages[0];
            if (fs.existsSync(refPath)) {
                referenceImageBase64 = fs.readFileSync(refPath).toString('base64');
            }
        }
        // Load domain knowledge for the template
        let domainKnowledge;
        const domainKnowledgePath = path.join(templateDir, 'domain-knowledge.txt');
        if (fs.existsSync(domainKnowledgePath)) {
            domainKnowledge = fs.readFileSync(domainKnowledgePath, 'utf-8');
        }
        // Generate the style reference grid
        const generationOptions = {
            description: options.description || options.name,
            audience: options.audience,
            visualStyle: options.visualStyle,
            referenceImageBase64,
            domainKnowledge,
        };
        console.log(`[StyleReferenceManager] Generating style reference with Nano Banana Pro`);
        console.log(`  Template: ${templateName}`);
        console.log(`  Name: ${options.name}`);
        console.log(`  Audience: ${options.audience || 'competitive'}`);
        const result = await (0, nano_banana_generator_1.generateStyleReferenceGrid)(refsDir, options.name, generationOptions);
        if (result.success && result.gridPath) {
            // Auto-set as active reference
            this.setActiveReference(templateName, `${options.name}.png`);
            return {
                success: true,
                path: result.gridPath,
                individualPaths: result.individualPaths,
                gridSizeKB: result.gridSizeKB,
            };
        }
        return {
            success: false,
            error: result.errors?.join('; ') || 'Generation failed',
        };
    }
    /**
     * Build prompt for style reference generation
     */
    buildStyleReferencePrompt(options) {
        const audienceStyles = {
            'recreational': 'friendly, approachable, casual sport photography',
            'young-athletes': 'dynamic, energetic, modern sports marketing for youth',
            'competitive': 'professional, intense, sports magazine editorial quality',
            'coaches': 'instructional, clear, technical demonstration focus',
            'beginners': 'welcoming, simple, easy-to-understand visual guides',
            'seniors': 'dignified, active lifestyle, age-appropriate representation',
            'tournament': 'competitive edge, professional sports photography',
        };
        const audienceStyle = audienceStyles[options.audience || 'competitive'] || audienceStyles['competitive'];
        const parts = [
            'Create a 2x2 grid of coaching illustration style reference images.',
            '',
            'GRID LAYOUT: 4 distinct examples showing consistent style applied to:',
            '1. Player serving technique',
            '2. Player at kitchen line dinking',
            '3. Court positioning diagram',
            '4. Drill instruction visual',
            '',
            `TARGET AUDIENCE: ${options.audience || 'competitive'}`,
            `AUDIENCE STYLE: ${audienceStyle}`,
        ];
        if (options.description) {
            parts.push('', `STYLE DESCRIPTION: ${options.description}`);
        }
        if (options.visualStyle) {
            parts.push('', `VISUAL PREFERENCES: ${options.visualStyle}`);
        }
        parts.push('', 'OUTPUT: Cohesive 2x2 grid showing unified visual language.');
        return parts.join('\n');
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
exports.StyleReferenceManager = StyleReferenceManager;
//# sourceMappingURL=style-reference-manager.js.map