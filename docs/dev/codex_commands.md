MODEL: GPT-5.3-codex
REASONING: low

Apply tool header standardization:

- Replace all fullscreen tool headers with:
  <Tool Name> — <Short Description>

- Remove:
  - intro paragraphs
  - multi-line headers

- Ensure:
  - truncation with ellipsis if needed
  - tooltip shows full text

- Bind UI to:
  tool.name
  tool.shortDescription

Target tools:
- Vector Map Editor
- Vector Asset Studio
- Sprite Editor
- State Inspector
