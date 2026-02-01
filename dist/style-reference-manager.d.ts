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
export interface StyleReferenceInfo {
    name: string;
    filename: string;
    path: string;
    sizeKB: number;
    isActive: boolean;
}
export interface GenerateReferenceOptions {
    name: string;
    description?: string;
    audience?: string;
    visualStyle?: string;
    refImages?: string[];
}
export declare class StyleReferenceManager {
    private templatesDir;
    constructor(repositoryPath: string);
    /**
     * Get the active style reference filename for a template
     */
    getActiveReference(templateName: string): string | null;
    /**
     * Set the active style reference for a template
     */
    setActiveReference(templateName: string, filename: string): void;
    /**
     * List all style references for a template
     */
    listStyleReferences(templateName: string): StyleReferenceInfo[];
    /**
     * Get the full path to the active style reference image
     */
    getActiveReferencePath(templateName: string): string | null;
    /**
     * Load the active style reference as base64
     */
    loadActiveReferenceBase64(templateName: string): string | null;
    /**
     * Generate a new style reference grid (placeholder for Nano Banana Pro integration)
     */
    generateStyleReference(templateName: string, options: GenerateReferenceOptions): Promise<{
        success: boolean;
        path?: string;
        error?: string;
    }>;
    /**
     * Build prompt for style reference generation
     */
    private buildStyleReferencePrompt;
    /**
     * Get template directory path
     */
    private getTemplateDir;
}
//# sourceMappingURL=style-reference-manager.d.ts.map