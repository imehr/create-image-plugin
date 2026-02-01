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
export interface DomainKnowledgeInfo {
    content: string;
    lineCount: number;
    sizeBytes: number;
    path: string;
}
export declare class DomainKnowledgeManager {
    private templatesDir;
    constructor(repositoryPath: string);
    /**
     * Get domain knowledge for a template
     */
    getDomainKnowledge(templateName: string): DomainKnowledgeInfo | null;
    /**
     * Update domain knowledge from content string
     */
    updateDomainKnowledge(templateName: string, content: string): DomainKnowledgeInfo;
    /**
     * Update domain knowledge from file
     */
    updateFromFile(templateName: string, filePath: string): DomainKnowledgeInfo;
    /**
     * Append text to domain knowledge
     */
    appendToDomainKnowledge(templateName: string, text: string): DomainKnowledgeInfo;
    /**
     * Get template directory path
     */
    private getTemplateDir;
}
//# sourceMappingURL=domain-knowledge-manager.d.ts.map