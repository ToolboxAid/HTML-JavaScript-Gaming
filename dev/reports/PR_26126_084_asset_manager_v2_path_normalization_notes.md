# PR_26126_084 Asset Manager V2 Path Normalization Notes

Date: 2026-05-06

## Rule

Selected file paths are normalized to repository-relative asset paths:

```text
HTML-JavaScript-Gaming/assets/audio/fire.wav -> assets/audio/fire.wav
C:\Users\davidq\Documents\GitHub\HTML-JavaScript-Gaming\assets\images\nebula-backdrop.png -> assets/images/nebula-backdrop.png
```

Backslashes are converted to `/`, repeated separators are collapsed, and the `HTML-JavaScript-Gaming` project-root prefix is removed when present.

## Fallback

If the browser does not expose a project-root path, Asset Manager V2 falls back to the derived kind folder and sanitized filename, for example:

```text
assets/images/nebula-backdrop.png
assets/audio/fire.wav
```

## Validation

Playwright validated both a Windows absolute project path and a project-root-prefixed path through the single picker flow. Both resolved to Workspace V2-safe relative paths before schema validation and insertion.
