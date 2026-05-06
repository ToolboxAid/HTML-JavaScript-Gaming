# First-Class Tool Starter

This folder is the official starter pattern for new first-class tools.

Copy this folder to `tools/<tool-id>/`, then rename the class prefixes, visible title, and tool id references for the new tool.

## Folder Structure

```text
tools/<tool-id>/
  index.html
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
    services/
      ToolStateSerializer.js
```

## Required Files

- `index.html`: semantic tool shell with no inline `<script>`, no inline `<style>`, and no inline event handlers.
- `styles/*.css`: all tool styles.
- `js/bootstrap.js`: small startup file that creates class instances and wires dependencies.
- `js/ToolStarterApp.js`: app/root coordinator only.
- `js/controls/*.js`: one class per UI control or section.
- `js/services/*.js`: focused non-UI helper classes when needed.
- `docs/CONTROL_SERVICE_CONTRACTS.md`: required control, service, app/root, logger, and batch processor contracts.
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
- App/root class coordinates only and must not own DOM logic or business logic.
- Controls own their DOM and their events.
- Controls communicate through injected callbacks or the app coordinator.
- Services contain non-DOM logic and return results/errors for the app, controls, or logger to display.
- Logger is the single writer for status/log output.
- Reusable UI behavior must live in reusable classes such as `AccordionSection`.
- Do not depend on `tools/shared`.
- Do not use inline event handlers such as `onclick`, `onchange`, or `oninput`.
- Do not add hidden defaults or silent fallback data.

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

Minimum coverage:

- tool page loads without runtime errors
- primary user action can be triggered or correctly blocked
- required controls render and respond
- accordion sections expand and collapse
- at least one failure state is visible when invalid input is applicable

The required validation command for impacted tool runtime or UI work is:

`npm run test:workspace-v2`

## Review Artifacts

Every PR that creates or changes a first-class tool must produce:

- `docs/dev/reports/codex_review.diff`
- `docs/dev/reports/codex_changed_files.txt`
- a PR-specific report under `docs/dev/reports/`
- a repo-structured delta ZIP under `tmp/`
