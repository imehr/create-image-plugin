# Create Image Plugin for Claude Code

Universal AI image generation plugin with template management, style references, domain knowledge editing, and multi-provider support.

## Features

- **Multi-Provider Support**: Gemini, VertexAI, OpenRouter with automatic fallback
- **Template Management**: Organize image styles by topic/style hierarchy
- **Style References**: Visual style guides for consistent image generation
- **Domain Knowledge**: System instructions for accurate content generation
- **Active Template Tracking**: Default template selection per session
- **Nano Banana Pro**: Generate 2x2 style reference grids using Gemini's image generation model

## Installation

```bash
# Clone to Claude Code plugins directory
git clone https://github.com/imehr/create-image-plugin.git ~/.claude/plugins/create-image

# Install dependencies
cd ~/.claude/plugins/create-image
npm install

# Build
npm run build
```

## Quick Start

```bash
# Generate an image
/create-image "A pickleball player demonstrating serve technique"

# List templates
/create-image-templates

# Manage style references
/create-image-refs sports/illustrative

# Edit domain knowledge
/create-image-rules sports/illustrative
```

## Commands

| Command | Description |
|---------|-------------|
| `/create-image <prompt>` | Generate an image |
| `/create-image-templates` | List/manage templates |
| `/create-image-refs <template>` | Manage style references |
| `/create-image-rules <template>` | View/edit domain knowledge |

## Configuration

Set environment variables:

```bash
# Gemini (primary)
export GOOGLE_API_KEY=your_key

# OpenRouter (fallback)
export OPENROUTER_API_KEY=your_key

# VertexAI (optional)
export GOOGLE_CLOUD_PROJECT=your_project
```

Or create `~/.config/create-image/config.yaml`:

```yaml
repositoryPath: ~/Documents/github/image-generator
defaultProvider: gemini
autoFallback: true
```

## Template Structure

```
templates/{topic}/{style}/
  config.json           # Template metadata
  style-guide.json      # Visual style specification
  domain-knowledge.txt  # System instructions
  .active-reference     # Active style reference
  style-references/     # Style reference images
  prompts/              # Type-specific prompts
```

## Providers

| Provider | Priority | Environment Variable |
|----------|----------|---------------------|
| Gemini | 1 | `GOOGLE_API_KEY` |
| VertexAI | 2 | `GOOGLE_CLOUD_PROJECT` |
| OpenRouter | 3 | `OPENROUTER_API_KEY` |

## Nano Banana Pro (Style Reference Generator)

Nano Banana Pro is Gemini's image generation model (`gemini-2.0-flash-preview-image-generation`) used to create style reference images for consistent visual generation.

### How It Works

1. **Four Prompt Variations**: Generates 4 individual images with varied coaching scenarios:
   - Player demonstrating proper form at the kitchen line
   - Court layout with player positioning from elevated angle
   - Two players in a rally with technique focus
   - Coaching drill setup from overhead perspective

2. **Grid Compositing**: Uses Sharp to composite the 4 images into a 2x2 grid (2056x2056px with 8px gap, minimum 2K resolution)

3. **Style Consistency**: Each image uses the same visual style parameters:
   - Target audience styling (recreational, competitive, coaches, etc.)
   - Visual preferences from template configuration
   - Domain knowledge injected as system instruction
   - Optional reference image for style matching

### Generation Flow

```
┌─────────────────┐
│ Template Config │
│ + Domain Knowledge │
│ + Style Preferences │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build 4 Prompts │
│ with variations │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼    ▼    ▼    ▼
┌────┐┌────┐┌────┐┌────┐
│ 1  ││ 2  ││ 3  ││ 4  │  Gemini API calls
└─┬──┘└─┬──┘└─┬──┘└─┬──┘  (with retry logic)
  │     │     │     │
  └─────┴─────┴─────┘
         │
         ▼
┌─────────────────┐
│ Sharp Composite │
│ 2x2 Grid (2056px)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ style-ref.png   │
│ + 4 individual  │
└─────────────────┘
```

### Audience Styles

| Audience | Visual Approach |
|----------|-----------------|
| recreational | Friendly, approachable, casual sport photography with warm colours |
| young-athletes | Dynamic, energetic, modern sports marketing with bold colours |
| competitive | Professional, intense, sports magazine editorial quality |
| coaches | Instructional, clear, technical demonstration focus |
| beginners | Welcoming, simple, easy-to-understand visual guides |
| seniors | Dignified, active lifestyle, age-appropriate representation |
| tournament | Competitive edge, professional sports photography |

### API Configuration

```bash
# Required for Nano Banana Pro
export GOOGLE_API_KEY=your_gemini_api_key
# or
export GEMINI_API_KEY=your_gemini_api_key
```

### Usage via Plugin

```typescript
import { createPlugin } from 'create-image';

const plugin = await createPlugin();

// Check if generation is available
const availability = plugin.styleRefManager.checkGenerationAvailability();
if (!availability.available) {
  console.log('Missing API key:', availability.reason);
}

// Generate a new style reference
const result = await plugin.styleRefManager.generateStyleReference('sports/illustrative', {
  name: 'competitive-training',
  description: 'Professional training drills',
  audience: 'competitive',
  visualStyle: 'high contrast, clear technique visibility',
});

if (result.success) {
  console.log('Generated:', result.path);
  console.log('Size:', result.gridSizeKB, 'KB');
  console.log('Individual images:', result.individualPaths);
}
```

### Retry Logic

- 3 retry attempts per image with exponential backoff
- 1.5 second delay between image generations to avoid rate limiting
- Graceful degradation: if some images fail, uses available images for grid

## Marketplace

Published to: **imehr0marketplace**

## License

MIT

## Author

imehr - https://github.com/imehr

### Resolution Options

The generator supports two output resolutions:

| Resolution | Individual Images | Grid Size | Use Case |
|------------|-------------------|-----------|----------|
| **2K** (default) | 1024×1024px | 2056×2056px | Screen display, web |
| **4K** | 2048×2048px | 4104×4104px | Print, large displays |

```typescript
// Generate at 2K (default)
const result2k = await plugin.styleRefManager.generateStyleReference('sports/illustrative', {
  name: 'training-2k',
  resolution: '2K',
});

// Generate at 4K for print quality
const result4k = await plugin.styleRefManager.generateStyleReference('sports/illustrative', {
  name: 'training-4k',
  resolution: '4K',
});
```
