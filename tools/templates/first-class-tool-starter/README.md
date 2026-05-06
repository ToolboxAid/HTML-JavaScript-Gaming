# First-Class Tool Starter

This folder is the official starter pattern for new first-class tools.

Copy this folder to `tools/<tool-id>/`, then rename the class prefixes, visible title, and tool id references for the new tool.

## Folder Structure

```text
tools/<tool-id>/
  index.html
  playwright.config.mjs
  README.md
  docs/
    CONTROL_SERVICE_CONTRACTS.md
  styles/
    toolStarter.css
  js/
    bootstrap.js
    ToolStarterApp.js
    controls/
      AccordionSection.js
      ActionNavControl.js
      InspectorControl.js
      PreviewPanelControl.js
      SourceInputControl.js
      StatusLogControl.js
      ToolStarterShellControl.js
    services/
      ToolStateSerializer.js
  tests/
    playwright/
      FirstClassToolStarter.spec.mjs
```

## Required Files

- `index.html`: semantic tool shell with no inline `<script>`, no inline `<style>`, and no inline event handlers.
- `playwright.config.mjs`: template-local Playwright config for validating the copied starter before registry integration.
- `styles/*.css`: all tool styles.
- `js/bootstrap.js`: small startup file that creates class instances and wires dependencies.
- `js/ToolStarterApp.js`: app/root coordinator only.
- `js/controls/*.js`: one class per UI control or section.
- `js/services/*.js`: focused non-UI helper classes when needed.
- `docs/CONTROL_SERVICE_CONTRACTS.md`: required control, service, app/root, logger, and batch processor contracts.
- `tests/playwright/*.spec.mjs`: starter behavior coverage to copy and rename with the new tool.
- `README.md`: tool-specific usage, contracts, and validation notes.

## Required Contracts

Read `docs/CONTROL_SERVICE_CONTRACTS.md` before creating or modifying a first-class tool from this starter.

The contracts define:

- Control responsibilities and method expectations.
- Service boundaries and result/error return expectations.
- App/root coordinator boundaries.
- Logger level requirements: OK, WARN, FAIL, SKIP, INFO.
- Batch processor discovery, per-item logging, and summary requirements.

## Architecture Rules

- One class per file.
- One control or section per class.
- Header markup follows the Palette Manager V2 pattern: `body.tools-platform-tool-page`, collapsible header/details, `#shared-theme-header`, and a tool-local header host.
- Header styling consumes `src/engine/theme/main.css`, `src/engine/ui/hubCommon.css`, and `src/engine/theme/accordionV2/accordionV2.css`.
- `ToolStarterShellControl` owns Hide Header and Details behavior, summary state, and fullscreen state classes.
- App/root class coordinates only and must not own DOM logic or business logic.
- Controls own their DOM and their events.
- Controls communicate through injected callbacks or the app coordinator.
- Services contain non-DOM logic and return results/errors for the app, controls, or logger to display.
- Logger is the single writer for status/log output.
- Reusable UI behavior must live in reusable classes such as `AccordionSection`.
- `tools/shared/` is deprecated for first-class tools:
  - no imports
  - no script references
  - no CSS references
  - no runtime dependency
- Do not use inline event handlers such as `onclick`, `onchange`, or `oninput`.
- Do not add hidden defaults or silent fallback data.

## Panel Layout Standard

First-class tools use a consistent three-column layout:

- Left panel: user input, setup, and intent controls only.
- Center panel: primary work surface, editor, canvas, or preview.
- Right panel: generated output, summaries, diagnostics, logs, and status.
- Status/log sections belong at the bottom of the right panel unless a PR explicitly justifies a different placement.

The starter demonstrates this standard with Input Source on the left, Preview in the center, and Output Summary above Status on the right.

## Creating A New Tool

1. Copy `tools/templates/first-class-tool-starter/` to `tools/<tool-id>/`.
2. Rename `ToolStarterApp` and control class names to match the new tool.
3. Update the visible title, subtitle, and `data-tool-id`.
4. Replace starter control labels with the real tool controls.
5. Keep JavaScript external and modular.
6. Keep CSS external.
7. Add first-class tool registry, index, and NAV wiring where applicable.
8. Add targeted Playwright launch coverage for the new tool.

## Playwright Launch Coverage

Every new first-class tool must include Playwright coverage that launches the tool and validates meaningful behavior.

The starter includes `tests/playwright/FirstClassToolStarter.spec.mjs` as a copyable baseline. Rename it with the new tool and keep the behavior depth.

Minimum coverage:

- tool page loads without runtime errors
- Palette Manager-style header shell is present
- primary user action can be triggered or correctly blocked
- accordion sections expand and collapse
- primary action button changes state when required input becomes valid
- status/log clear behavior works
- at least one failure state is visible when invalid input is applicable

The required validation command for impacted tool runtime or UI work is:

`npm run test:workspace-v2`

When validating only the copied starter before registry integration, run the copied tool's Playwright spec directly and then add it to the relevant workspace/tool test lane.

Template-local command:

`npx playwright test --config tools/<tool-id>/playwright.config.mjs`

## Review Artifacts

Every PR that creates or changes a first-class tool must produce:

- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
- a PR-specific report under `docs/dev/reports/`
- a repo-structured delta ZIP under `tmp/`
