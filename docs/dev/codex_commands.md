# Codex Command — PR 11.86

Model: GPT-5.4
Reasoning: high

```bash
codex exec --model gpt-5.4 --reasoning high "Apply PR 11.86. Enforce bezel stretch SSoT in game manifests: move/remove any stretchOverride.uniformEdgeStretchPx from asset-browser.assets.bezel or equivalent duplicate browser/chrome config, and keep/add it only on image.*.bezel manifest entries. Ensure image.asteroids.bezel has stretchOverride.uniformEdgeStretchPx set to 10. Do not add fallback bezel/background loading. Do not add aliases or duplicate contracts. Produce a report under docs/dev/reports."
```
