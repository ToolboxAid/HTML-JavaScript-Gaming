
Model: GPT-5 high
Reasoning: high

Fix click handler in:
tools/Workspace Manager/main.js

- Use dataset.toolId from clicked element
- Remove any fallback/default tool logic

Validate:
node --check tools/Workspace Manager/main.js

Manual:
Click SVG → verify correct logs
