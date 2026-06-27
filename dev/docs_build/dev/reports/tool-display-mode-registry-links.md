# Tool Display Mode Registry Links

PR: PR_26155_101-tool-display-mode-registry-links

## Summary

- Previous/Next navigation remains registry-driven through `getToolNavigationTargets(toolSlug)`.
- Tool pages do not hardcode previous or next labels/routes.
- Enabled previous/next controls render as anchors.
- Missing previous/next controls render disabled text with a `pill` class instead of a broken link.
- Multi-path next destinations still route to Toolbox Group view with the target group expanded.
- Current `role` query parameter is preserved when building navigation links.

## Verified Routes

- Game Design:
  - Previous: Project Workspace
  - Next: Game Configuration
- Project Workspace:
  - Previous: AI Assistant
  - Next: Game Design
- Game Configuration:
  - Previous: Game Design
  - Next: Design Tools through `toolbox/index.html?view=group&group=design`
- AI Assistant:
  - Previous: disabled text
  - Next: Project Workspace

## Validation

- PASS: `npm run test:lane:tool-display-mode`
- PASS: `npm run test:lane:tool-navigation`
- PASS: `git diff --check`

## Manual Test Notes

1. Open `toolbox/project-workspace/index.html?role=user`.
2. Confirm Previous/Next routes match registry build order.
3. Open `toolbox/game-configuration/index.html?role=admin`.
4. Confirm Next routes to `toolbox/index.html?view=group&group=design&role=admin`.
5. Click the link and confirm only the Design accordion is expanded.

## Skipped Lane Rationale

- Game Design, Game Configuration, and Project Workspace runtime lanes were skipped because no tool repository, save/update, validation, handoff, or project data behavior changed.
- Engine and samples lanes were skipped because no engine runtime or sample JSON behavior changed.
