---
name: create-image-refs
description: List and manage style reference images for AI illustration templates
args: <template> [action] [options]
---

# Style Reference Management

Manage style reference images that guide the visual style of generated images.

## Usage

```bash
/create-image-refs <template> [action] [options]
```

## Actions

### List Style References (default)
```bash
/create-image-refs sports/illustrative
```

### Set Active Reference
```bash
/create-image-refs <template> set <filename>
```

### Generate New Reference
```bash
/create-image-refs <template> generate --name <name> [options]
```

Options:
- `--name <name>` - Name for the generated reference (required)
- `--description <text>` - Style description
- `--audience <type>` - Target audience (recreational, young-athletes, competitive, coaches, beginners, seniors, tournament)
- `--visual-style <text>` - Visual preferences

## How Style References Work

1. When generating an image, the active style reference is loaded
2. The reference image is sent alongside the prompt
3. The AI model uses it as visual guidance
4. Output matches the style, colors, and composition

## File Structure

```
templates/{topic}/{style}/
  .active-reference           # Active reference filename
  style-references/
    modern-minimalist-01.png
    modern-minimalist-02.png
    ...
```

## Related Commands
- `/create-image-templates` - Manage templates
- `/create-image-rules` - Edit domain knowledge
