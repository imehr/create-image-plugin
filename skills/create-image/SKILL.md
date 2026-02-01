---
name: create-image
description: Universal AI image generation with template management, style references, and provider fallback. Use when generating images, managing illustration templates, or configuring visual styles for any project.
---

# Create Image

Universal AI image generation plugin for Claude Code with comprehensive template management, style references, and multi-provider support.

## When to Use

Use this skill when:
- Generating AI images from text prompts
- Managing illustration templates and styles
- Configuring style references for consistent visual output
- Editing domain knowledge (system instructions) for image generation
- Switching between image generation providers (Gemini, OpenRouter, VertexAI)

## Quick Start

```bash
# Generate an image
/create-image "A pickleball player demonstrating the serve technique"

# List available templates
/create-image-templates

# Manage style references
/create-image-refs illustrative

# Update domain knowledge
/create-image-rules illustrative
```

## Available Commands

| Command | Description |
|---------|-------------|
| `/create-image <prompt>` | Generate an image with auto-selected template |
| `/create-image-templates` | List all available templates |
| `/create-image-refs <template>` | List and manage style references |
| `/create-image-rules <template>` | View/edit domain knowledge |
| `/create-image-health` | Check provider health status |
| `/create-image-config` | View current configuration |

## Template Management

### List Templates

Shows all available templates with metadata:
- Template name (topic/style format)
- Description
- Active status
- Style references count
- Domain knowledge lines

### Style References

Style references are image grids that guide the visual style of generated images. The plugin supports:

- **Listing**: View all style references for a template
- **Activating**: Set which reference is used by default
- **Generating**: Create new style reference grids with Nano Banana Pro

### Domain Knowledge

Domain knowledge files contain rules and instructions that are injected as system prompts during image generation. They ensure:

- Accurate sport/domain representation
- Correct positioning and proportions
- Equipment and context accuracy
- Common AI mistake prevention

## Provider Management

### Supported Providers

| Provider | Priority | Notes |
|----------|----------|-------|
| Gemini | 1 | Primary, requires `GOOGLE_API_KEY` |
| VertexAI | 2 | GCP integration, requires project config |
| OpenRouter | 3 | Fallback, requires `OPENROUTER_API_KEY` |

### Automatic Fallback

When enabled, the plugin automatically tries the next provider if the primary fails:

```
Gemini -> VertexAI -> OpenRouter
```

## Configuration

Configuration is loaded from:
1. `~/.config/create-image/config.yaml` (user config)
2. Environment variables (API keys)
3. Runtime overrides

### Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Gemini API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `GOOGLE_CLOUD_PROJECT` | GCP project for VertexAI |
| `GEMINI_MODEL` | Override default Gemini model |

### Config File Example

```yaml
# ~/.config/create-image/config.yaml
repositoryPath: ~/Documents/github/image-generator
defaultProvider: gemini
autoFallback: true
cacheEnabled: true
cacheTTL: 3600000

# defaultTemplate: sports/illustrative
```

## Template Structure

Templates follow the topic/style format and are stored in:
`{repositoryPath}/templates/{topic}/{style}/`

```
templates/sports/illustrative/
  config.json           # Template metadata
  style-guide.json      # Visual style specification
  domain-knowledge.txt  # System instructions
  .active-reference     # Currently active style reference
  style-references/     # Style reference images
    modern-minimalist-01.png
    ...
  prompts/              # Type-specific prompt templates
    serve-technique.txt
    court-diagram.txt
    ...
```

## Image Types

Templates can support multiple image types with specialized prompts:

- `serve-technique` - Serve demonstrations
- `court-diagram` - Overhead court views
- `player-position` - Player positioning
- `rule-infographic` - Rule explanations
- `violation-scenario` - Violation depictions
- `referee-position` - Referee positioning

## Usage Examples

### Generate with Specific Template

```bash
/create-image "Player at kitchen line executing a dink shot" --template sports/illustrative --type dink-technique
```

### Generate with Style Reference

```bash
/create-image "Serve technique demonstration" --style-grid modern-minimalist-01.png
```

### Check System Status

```bash
# View all templates
/create-image-templates

# Check provider health
/create-image-health

# View configuration
/create-image-config
```

## Caching

The plugin caches:
- Template configurations (1 hour default TTL)
- Provider health checks (5 minutes)
- Template registry (until manually rebuilt)

Clear caches with configuration reload if templates are updated.

## Related

- Web UI: Access template management via your project's `/illustrations` page
- External Repo: `~/Documents/github/image-generator`
- Configuration: `~/.config/create-image/config.yaml`
