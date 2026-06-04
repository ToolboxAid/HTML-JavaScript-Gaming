# PLAN_PR_10_16_FULLSCREEN_EXIT_STATE_RESTORE_FIX

## Purpose
Fix fullscreen exit so the platform shell fully returns to normal browser-window mode.

## Problem
Clicking Exit Fullscreen exits the browser fullscreen layer but leaves the tool shell visually/stylistically stuck in fullscreen mode.

## Scope
- Shared platform fullscreen state cleanup only.
- Ensure Exit Fullscreen and browser/Escape fullscreen exit use the same restore path.
- Clear all fullscreen markers/classes/attributes/state.
- Restore normal header/details behavior.
- No tool data, registry, manifest, or start_of_day changes.

## Acceptance
- Clicking Exit Fullscreen returns to normal browser window layout.
- Escape/browser fullscreen exit returns to normal browser window layout.
- Header is visible/restored in normal mode.
- Fullscreen-only summary/compact styles are removed after exit.
- No leftover fullscreen body/html/tool classes or data attributes.
