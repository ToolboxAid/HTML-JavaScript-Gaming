# Codex Commands - PR 11.187

Model: GPT-5 high
Reasoning: high

Commit/restart documentation only.

Do not modify:
- schemas
- samples
- games
- runtime tool code

Create/keep docs that define the restart lane:

- Tool v2 migration
- Palette first
- session-backed shared data
- reverse engineer tools, do not copy old code
- move old tools to `<tool>-v1`
- support data load paths:
  1. workspace from URL -> session -> tool
  2. tool from URL -> session -> tool
  3. tool from workspace session

Validation:
- docs only; no runtime validation required
- full samples smoke skipped because this is commit/restart documentation

Return ZIP artifact at:
`<project folder>/tmp/PR_11_187_20260430_01.zip`
