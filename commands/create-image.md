---
name: create-image
description: Generate AI images using templates, style references, and multiple providers with automatic fallback
args: <prompt> [options]
---

# Generate AI Image

Generate images using AI with template support, style references, and provider fallback.

## Usage

```bash
/create-image <prompt> [options]
```

## Options

| Option | Description |
|--------|-------------|
| `--template <name>` | Template in topic/style format (e.g., sports/illustrative) |
| `--type <type>` | Image type for specialized prompts (e.g., serve-technique) |
| `--provider <name>` | Force specific provider (gemini, openrouter, vertexai) |
| `--model <model>` | Override model for generation |
| `--output <path>` | Output file path (default: auto-generated) |
| `--style-grid <file>` | Path or name of style reference image |

## Examples

### Basic Generation
```bash
/create-image "A professional pickleball player demonstrating proper serve technique"
```

### With Template
```bash
/create-image "Kitchen line dink shot demonstration" --template sports/illustrative
```

### With Image Type
```bash
/create-image "Overhead court view showing doubles positioning" --template sports/illustrative --type court-diagram
```

## Provider Fallback

When a provider fails, the system automatically tries the next available provider:
1. Gemini (priority 1)
2. VertexAI (priority 2)
3. OpenRouter (priority 3)

## Related Commands
- `/create-image-templates` - List available templates
- `/create-image-refs` - Manage style references
- `/create-image-health` - Check provider status
