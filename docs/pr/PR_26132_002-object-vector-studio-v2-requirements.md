# PR_26132_002-object-vector-studio-v2-requirements

## Purpose

Document Object Vector Studio V2 requirements before runtime implementation and normalize user-facing studio names to `Object Vector Studio V2` and `World Vector Studio V2`.

## Changes

- Updated user-facing labels for the new studios to include `V2`.
- Added Object Vector Studio V2 requirements/design documentation at `tools/object-vector-studio-v2/docs/OBJECT_VECTOR_STUDIO_V2_REQUIREMENTS.md`.
- Documented schema-only session loading, launched-with-parameters file reads, required palette behavior, responsive hide-header layout, accordion space sharing, scrollable controls, selected item visibility, object tiles, column responsibilities, workspace nav, and tool nav.
- Kept Primitive Skin Editor and Vector Map Editor available and only updated their deprecation text to point to the V2 studio names.

## Playwright Impact

Playwright impacted: No.

No Playwright impact. This PR is requirements/docs and user-facing naming only.

## Validation

- Playwright was not run because this PR does not implement runtime behavior.
- Full samples smoke test was not run per BUILD scope; this is requirements/docs only.

## Manual Validation

1. Open `tools/object-vector-studio-v2/docs/OBJECT_VECTOR_STUDIO_V2_REQUIREMENTS.md`.
2. Confirm it covers schema-only session loading, launched-with-parameters file read, required palette, responsive hide-header layout, accordion behavior, scrollable controls, selected item visibility, left/right column responsibilities, object tiles, workspace nav, and tool nav.
3. Open the tool index after the previous PR is applied and confirm the user-facing names read `Object Vector Studio V2` and `World Vector Studio V2`.

Expected outcome: documentation is present and no runtime behavior is added in this PR.
