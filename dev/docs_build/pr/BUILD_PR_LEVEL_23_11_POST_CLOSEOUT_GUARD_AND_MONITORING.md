# BUILD PR LEVEL 23.11
## Post-Closeout Guard and Monitoring

### Purpose
Ensure fullscreen rule remains permanently enforced after closeout.

### Scope
- Reinforce guard rules
- Add ongoing monitoring expectations
- Prevent regression
- Reuse existing validation automation (do not create duplicate checks)

### Required Reuse On Future PRs Touching `samples/`
- Run fullscreen scan:
  - `rg -n --glob "samples/**" "requestFullscreen|webkitRequestFullscreen|engine\\.fullscreen|fullscreenPreferred|settings-fullscreen"`
- Run fullscreen guard tests:
  - `tests/samples/FullscreenRuleEnforcement.test.mjs`
  - `tests/samples/FullscreenAbility0713ViewportFit.test.mjs`

### Acceptance
- Fullscreen remains restricted to sample 0713
- Any regression is detectable
- No engine changes
