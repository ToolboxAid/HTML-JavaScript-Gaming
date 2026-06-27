# PR 11.29 — Fullscreen Tool Title / Description Binding

## Purpose
Fix fullscreen chrome display so it shows the active tool name and description instead of the configuration-error fallback.

## Problem
When entering fullscreen, the header/title area should display:

<tool name> - <description>

Instead, description currently shows:

Configuration error (open title for details)

## Required Change
Bind fullscreen title/description to the active tool manifest metadata already available to Workspace Manager/platform shell.

## Scope
- Fix fullscreen display/chrome binding only.
- Do not change fullscreen enter/exit behavior.
- Do not change Workspace Manager payload fan-out.
- Do not change tool enablement.
- Do not change sample 1902 payload/schema.
- Do not add hardcoded descriptions.
- Do not add fallback sample/tool data.
- Do not touch start_of_day folders.

## Expected Behavior
For any opened tool, fullscreen display should show:

<tool display name> - <tool description>

Example:
Vector Map Editor - <Vector Map Editor manifest description>

If description is truly missing from manifest metadata, show a safe empty description or documented neutral fallback, but do not show the configuration-error text when valid manifest metadata exists.

## Investigation Targets
- fullscreen header/chrome title rendering
- active tool metadata lookup
- tool manifest description resolver
- configuration error fallback path

## Acceptance
- Entering fullscreen shows active tool name.
- Entering fullscreen shows active tool description from manifest metadata.
- The text "Configuration error (open title for details)" does not appear for tools with valid manifest description.
- Fullscreen exit behavior remains unchanged.
- Runtime smoke test passes.
