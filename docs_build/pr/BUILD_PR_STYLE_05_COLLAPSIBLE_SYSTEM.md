# BUILD_PR_STYLE_05_COLLAPSIBLE_SYSTEM

## Purpose
Introduce the shared `.is-collapsible` system to reduce vertical space usage and standardize collapsible behavior across pages.

## Scope
- Replace `hideme` with `.is-collapsible`
- Apply to header intro/title areas on main index pages
- CSS-first implementation
- Minimal JS only if required

## Rules
- No inline styles
- No legacy class reuse
- Keep behavior consistent across all pages

## Acceptance
- `.is-collapsible` works consistently
- Header/intro sections can collapse/expand
- No layout breakage
- Minimal JS used (or none if CSS-only works)
