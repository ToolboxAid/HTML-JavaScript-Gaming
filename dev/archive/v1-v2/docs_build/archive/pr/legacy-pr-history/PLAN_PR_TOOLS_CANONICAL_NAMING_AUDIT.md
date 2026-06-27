# PLAN_PR_TOOLS_CANONICAL_NAMING_AUDIT

## Goal
Lock the final approved canonical naming and path convention for active tool folders and related references so future renames do not create path drift again.

## Canonical Active Tool Paths
- `toolbox/Sprite Editor/`
- `toolbox/Tilemap Studio/`
- `toolbox/Parallax Scene Studio/`
- `toolbox/Vector Asset Studio/`
- `toolbox/Vector Map Editor/`
- `toolbox/shared/`

## Naming Rules
- Use approved human-readable studio names for active editor-style tools.
- Use one canonical folder per active tool.
- Do not keep parallel wrapper folders once a canonical tool path is live.
- Update launcher links, README examples, sample manifests, and validation docs in the same change as any future rename.
- Keep `toolbox/SpriteEditor_old_keep/` and `toolbox/Sprite Editor/` treated as explicit legacy paths unless separately retired by a dedicated legacy cleanup plan.

## Required Reference Surfaces
- `toolbox/index.html`
- tool `index.html` entrypoints
- tool `README.md` files
- sample manifests and sample-relative asset paths
- validation reports and current BUILD/APPLY docs when paths change

## Audit Checks
- inventory folders directly under `toolbox/`
- flag any pair where a canonical tool and an alternate renamed folder coexist
- flag launcher entries that point outside canonical folders
- flag sample manifests or asset paths that resolve through non-canonical folders
- flag any newly introduced required references to legacy `toolbox/SpriteEditor_old_keep/`

## Expected Outcome
- canonical paths remain stable
- rename drift is caught at the docs and launcher layer early
- future tool renames require an explicit plan instead of silent wrapper drift
