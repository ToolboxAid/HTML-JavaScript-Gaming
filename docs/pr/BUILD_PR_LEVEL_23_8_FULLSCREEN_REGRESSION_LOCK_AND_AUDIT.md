# BUILD PR LEVEL 23.8
## Fullscreen Regression Lock and Audit

### Purpose
Lock fullscreen behavior rules and prevent future regression outside sample 0713.

### Scope
- Enforce rule: fullscreen ONLY allowed in sample 0713
- Audit all samples for violations
- Prevent Codex from introducing fullscreen elsewhere
- Fix sample 0713 to correctly fill screen while maintaining aspect ratio

### Constraints
- No engine changes
- No rendering changes outside sample 0713 behavior fix
- No gameplay impact

### Acceptance
- Only sample 0713 contains fullscreen logic
- All other samples explicitly exclude fullscreen
- Sample 0713 fills screen correctly while preserving aspect ratio (no letterboxing gaps)
