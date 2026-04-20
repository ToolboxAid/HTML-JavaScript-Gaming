# BUILD_PR — Index Full Height + SEO Content

## Purpose
Ensure /index.html fills full viewport height and add light SEO/engaging content.

## Scope
- /index.html only
- No changes to other pages
- No layout restructuring beyond height fill

## Changes
1. Ensure page fills viewport height (min-height: 100vh applied at shell level excluding page-shell rule constraints)
2. Add short engaging intro content:
   - lightweight description of platform
   - keywords for SEO
   - readable, non-intrusive

## Content Addition (example)
"Build, play, and explore classic-style games and modern tools in one place. 
This platform showcases interactive samples, arcade-inspired games, and developer tools designed for learning, experimentation, and performance testing."

## Rules
- No inline styles
- Use existing theme structure
- No new components

## Validation
- Page fills full screen (no bottom gap)
- Content renders cleanly
- No layout regressions
