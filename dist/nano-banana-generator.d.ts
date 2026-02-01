/**
 * Nano Banana Pro Generator
 *
 * Generates style reference images using Gemini's image generation model
 * (internally called "Nano Banana Pro").
 *
 * Workflow:
 * 1. Generate 4 individual images with varied prompts
 * 2. Composite them into a 2x2 grid
 * 3. Save both individual images and the composite grid
 *
 * This matches the web UI implementation at /illustrations
 */
export type Resolution = '2K' | '4K';
export interface GenerationOptions {
    description: string;
    audience?: string;
    visualStyle?: string;
    resolution?: Resolution;
    referenceImageBase64?: string;
    domainKnowledge?: string;
}
export interface GenerationResult {
    success: boolean;
    gridPath?: string;
    individualPaths?: string[];
    gridSizeKB?: number;
    generatedCount?: number;
    failedCount?: number;
    resolution?: Resolution;
    errors?: string[];
}
export declare function generateStyleReferenceGrid(outputDir: string, baseName: string, options: GenerationOptions): Promise<GenerationResult>;
export declare function isGenerationAvailable(): {
    available: boolean;
    reason?: string;
};
//# sourceMappingURL=nano-banana-generator.d.ts.map