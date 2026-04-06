# APPLY_PR_DEBUG_SURFACES_ADVANCED_UX

## Purpose

Apply the approved advanced UX plan by creating the first reusable panel groups, quick toggles, macros, and optional shortcut helpers for the promoted debug surfaces platform.

## Apply Scope

### Create Shared Group Infrastructure
- panel group registry
- shared panel group registrations
- group commands

### Create Shared Macro Infrastructure
- macro registry
- macro executor
- shared macro registrations
- macro commands

### Create Shared Toggle Helpers
- quick toggle commands

### Create Optional Shortcut Helpers
- optional debug shortcut registration

### Keep Local
- project-specific macros
- project-specific shortcuts
- scene-specific workflow helpers
- tool-specific workflow helpers

## Apply Rules

- keep adoption opt-in
- preserve public API boundaries
- macros compose approved public commands/actions only
- shortcut registration remains optional and debug-only
- validate through sample and tool integrations
