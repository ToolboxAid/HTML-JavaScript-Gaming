# Codex Commands - PR_26126_003-preview-tool-layout-spec

```bash
codex run "Create PR_26126_003-preview-tool-layout-spec. Convert the preview tool design into a concrete layout spec for tools/preview/index.html. Define exact regions (header, left panel controls, main preview canvas, right panel properties, footer actions). Specify each control placement (input source, validation status, preview mode selector, zoom, background toggle, export buttons). Include DOM structure outline (ids/classes only, no implementation), state model (toolState shape), and interaction flows (load -> validate -> render -> export). No runtime code. Do not modify samples. Place doc under docs/pr/PR_26126_003-preview-tool-layout-spec.md and produce required review artifacts."
```

## Validation Commands

```bash
git diff --check -- docs/pr/PR_26126_003-preview-tool-layout-spec.md docs/dev/codex_commands.md docs/dev/commit_comment.txt
node --input-type=module <write PR-scoped review artifacts>
```

## Playwright

No Playwright impact. This PR is a documentation/layout-spec-only PR for the Preview tool and does not modify implementation code.

## Full Samples

Full samples smoke test was skipped because this PR is documentation-only and sample files are out of scope.
