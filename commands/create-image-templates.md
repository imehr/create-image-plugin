---
name: create-image-templates
description: List and manage AI image generation templates with style references and domain knowledge
args: [action] [options]
---

# Template Management

List, view, and manage AI image generation templates.

## Usage

```bash
/create-image-templates [action] [options]
```

## Actions

### List All Templates (default)
```bash
/create-image-templates
/create-image-templates list
```

### Show Template Details
```bash
/create-image-templates show <template>
```

### Set Active Template
```bash
/create-image-templates set-active <template>
```

### Search Templates
```bash
/create-image-templates search <keyword>
```

### Rebuild Registry
```bash
/create-image-templates rebuild
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

## Config.json Fields

| Field | Description |
|-------|-------------|
| `name` | Display name |
| `topic` | Category (e.g., sports) |
| `style` | Style variant (e.g., illustrative) |
| `description` | Template description |
| `version` | Template version |
| `tags` | Searchable tags |
| `aspectRatio` | Default aspect ratio |
| `model` | Preferred AI model |

## Related Commands
- `/create-image-refs` - Manage style references
- `/create-image-rules` - Edit domain knowledge
