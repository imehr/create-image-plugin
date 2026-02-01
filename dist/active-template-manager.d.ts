/**
 * Active Template Manager
 *
 * Manages which template is currently active for image generation.
 * Mirrors the web UI active template selection.
 */
export declare class ActiveTemplateManager {
    private templatesDir;
    private activeStylePath;
    constructor(repositoryPath: string);
    /**
     * Get the currently active template name
     */
    getActiveTemplate(): string;
    /**
     * Set the active template
     */
    setActiveTemplate(templateName: string): void;
    /**
     * Check if a template is the active one
     */
    isActive(templateName: string): boolean;
    /**
     * Get full path to active template directory
     */
    getActiveTemplateDir(): string;
}
//# sourceMappingURL=active-template-manager.d.ts.map