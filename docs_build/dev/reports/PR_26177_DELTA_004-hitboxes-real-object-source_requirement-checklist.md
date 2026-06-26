# PR_26177_DELTA_004 Hitboxes Real Object Source Requirement Checklist

| Requirement | Status | Notes |
|---|---|---|
| Replace read-only foundation messaging | PASS | Hitboxes now presents Object A source selection and preview panels. |
| Left panel lists Objects from API/service contract | PASS | Hitboxes uses `createServerRepositoryClient("objects")`. |
| Only include Objects with assigned visuals | PASS | Source list filters to Objects with visual asset key or preview metadata. |
| Show object name | PASS | Object source table and preview title show the Object name. |
| Show object key | PASS | Object source table and metadata panel show the Object key. |
| Show visual asset label/type | PASS | Object source table and metadata panel show visual label/type. |
| Required empty state | PASS | Empty state uses: `Create an Object and assign a sprite or vector before editing hitboxes.` |
| Selecting Object loads Object A | PASS | Source buttons set selected Object A and update center/right panels. |
| Center visual preview area | PASS | Center panel includes assigned visual image hook, fallback frame, bounding box, and origin marker. |
| Actual assigned visual if available | PASS | Preview image uses assigned preview path when provided by the Objects contract. |
| Safe fallback when rendering pending | PASS | Fallback states that assigned visual metadata exists and rendering is pending. |
| Right panel selected metadata | PASS | Inspector shows selected name, key, visual, bounds, and origin. |
| Remove deferred drawing/editing copy | PASS | Foundation-only deferred copy was removed from Hitboxes UI. |
| No hitbox drawing | PASS | No drawing, rectangle creation, or hitbox persistence added. |
| No Object B | PASS | UI only supports Object A. |
| No unrelated cleanup | PASS | Scope remained limited to Hitboxes and tests/reports. |
| Playwright coverage added | PASS | `tests/playwright/tools/HitboxesTool.spec.mjs` covers source selection and metadata/preview assertions. |
