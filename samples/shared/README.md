# samples/shared

Canonical shared sample boundary.

## What belongs here
- reusable sample helpers used by 2+ samples
- shared sample runtime/bootstrap utilities
- shared sample presentation helpers (for example detail-page enhancement and base layout shim)

## What stays sample-owned
- logic specific to a single sample folder
- sample-specific assets and one-off helpers

## Engine boundary rule
Sample code may consume only approved public engine surfaces (for example `/src/engine/*/index.js` and `/src/engine/core/Engine.js`).

## Compatibility
`samples/_shared` remains as a compatibility shim surface and should re-export or proxy to this canonical `samples/shared` boundary.
