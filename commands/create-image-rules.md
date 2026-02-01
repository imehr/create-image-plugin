---
name: create-image-rules
description: View and edit domain knowledge (system instructions) for AI image generation templates
args: <template> [action] [options]
---

# Domain Knowledge Management

View and edit the domain knowledge (system instructions) that guide AI image generation.

## Usage

```bash
/create-image-rules <template> [action] [options]
```

## Actions

### View Rules (default)
```bash
/create-image-rules sports/illustrative
```

### Update Rules
```bash
/create-image-rules <template> update --file <path>
```

### Append Rules
```bash
/create-image-rules <template> append --text "RULE X: New rule here"
```

## What is Domain Knowledge?

Domain knowledge is a text file containing rules and instructions injected as system prompts during image generation. It ensures:
- Accurate sport/domain representation
- Correct positioning and proportions
- Equipment accuracy
- Common AI mistake prevention

## Content Guidelines

### What to Include
- Player positioning rules
- Equipment standards
- Court/field dimensions
- Common AI mistakes to avoid

### What NOT to Include
- Visual style (use style references)
- Model parameters (use config.json)
- Prompting techniques (handled by prompt builder)

## File Location

```
templates/{topic}/{style}/domain-knowledge.txt
```

## Related Commands
- `/create-image-templates` - Manage templates
- `/create-image-refs` - Manage style references
