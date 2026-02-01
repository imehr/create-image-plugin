# Create Image Plugin for Claude Code

Universal AI image generation plugin with template management, style references, domain knowledge editing, and multi-provider support.

## Features

- **Multi-Provider Support**: Gemini, VertexAI, OpenRouter with automatic fallback
- **Template Management**: Organize image styles by topic/style hierarchy
- **Style References**: Visual style guides for consistent image generation
- **Domain Knowledge**: System instructions for accurate content generation
- **Active Template Tracking**: Default template selection per session

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

## Marketplace

Published to: **imehr0marketplace**

## License

MIT

## Author

imehr - https://github.com/imehr
