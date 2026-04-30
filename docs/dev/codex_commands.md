# Codex Commands — PR 11.90

Model: GPT-5.4
Reasoning: high

Run Codex with this task:

```text
Apply PR 11.90 from docs/pr/PR_11_90_ASTEROIDS_ENGINE_OWNERSHIP_AND_FONT_MANIFEST.md.

Use the uploaded Asteroids.zip inspection findings as evidence. Finish Asteroids engine ownership correctness: remove remaining game-level background/clear/bezel ownership, keep gameplay-only rendering in Asteroids, make game.manifest.json the only source for bezel/background/font assets, add font.asteroids.vector-battle under asset-browser.assets, set image.asteroids.bezel to bezel1.png with stretchOverride.uniformEdgeStretchPx=10, set image.asteroids.background to deluxe.png, and verify no guessed chrome asset paths remain.

Return a repo-structured ZIP at <project folder>/tmp/PR_11_90_ASTEROIDS_ENGINE_OWNERSHIP_AND_FONT_MANIFEST.zip with changed files and a short validation report.
```
