# MASTER_ROADMAP_RECOVERY.md

## Phase 20 Recovery

- [x] Audit completed
- [x] Recovery path applied (reset to baseline)
- [x] Remove anti-pattern drift through constrained replay PRs
- [x] Enforce SSoT for tool launch across games and samples
- [x] Enforce external-launch memory reset without fallback behavior
- [ ] Validate Workspace Manager launch flow from `games/index.html`
- [x] Re-verify codex rule enforcement on recovery lane
- [ ] Resume normal roadmap progression after recovery gate passes

## Current Recovery Position

Recovery is being handled as reset-to-baseline plus constrained replay PRs.

The current controlled replay sequence is:

1. `BUILD_PR_LEVEL_20_7_TOOL_LAUNCH_SSOT_SPEC`
   - Defines the launch behavior contract.
2. `BUILD_PR_LEVEL_20_8_IMPLEMENT_TOOL_LAUNCH_SSOT_ROUTING_V2`
   - Replays routing under strict labels:
     - samples: `Open <tool>`
     - games: `Open with Workspace Manager`
3. `BUILD_PR_LEVEL_20_9_TOOL_LAUNCH_SSOT_DATA_LAYER`
   - Centralizes launch target data into one SSoT.
4. `BUILD_PR_LEVEL_20_10_REMOVE_LEGACY_LAUNCH_FALLBACK_RESIDUE`
   - Removes remaining fallback/default residue after SSoT routing.

## Gate Remaining

The remaining hard gate is UAT validation:

```text
games/index.html
  -> Open with Workspace Manager
  -> tools/Workspace Manager/index.html
  -> memory cleared
  -> explicit context loaded
  -> no fallback/default behavior
```

Normal roadmap progression should not resume until that UAT gate passes.
