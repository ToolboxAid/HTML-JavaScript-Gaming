# Legal Changelog

## Version 1.0 — June 24, 2026

Initial legal foundation package for Game Foundry Studio LLC.

Included:

- Legal Overview
- Terms of Service
- Privacy Policy
- Cookie Policy
- Community Guidelines
- Copyright Policy
- DMCA Policy

Implementation requirements added:

- Public `/legal/` page structure
- Footer legal links
- Shared left-side legal navigation
- `/legal/legal-nav.js` as the single source of truth
- JavaScript current-page selection using `window.location.pathname`
- `aria-current="page"` on the selected legal page
