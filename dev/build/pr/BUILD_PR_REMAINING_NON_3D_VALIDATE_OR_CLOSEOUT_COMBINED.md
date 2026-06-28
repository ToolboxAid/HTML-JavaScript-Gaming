# BUILD_PR_REMAINING_NON_3D_VALIDATE_OR_CLOSEOUT_COMBINED

## Purpose
Close the remaining non-3D roadmap items in one validate-first combined pass.

## Validate-first rule
For each target item:
- inspect repo truth first
- if already complete, mark complete
- if partially complete, do the smallest valid remaining work
- if incomplete, build only the smallest necessary residue
- do not recreate work that already exists

## Target non-3D items
- Existing games asset folders updated so existing images / vectors / related runtime assets can be transformed into tool-editable `data/` objects, with corresponding project JSON updates
- Execute 2D capability polish lanes
- Reduce legacy footprint after replacements are proven

## Roadmap/meta handling
- update summary/status rows if repo truth now supports it
- status markers only
- no roadmap text rewrite

## Constraints
- no 3D work
- no broad repo-wide cleanup
- no unrelated repo changes

## Packaging
<project folder>/tmp/BUILD_PR_REMAINING_NON_3D_VALIDATE_OR_CLOSEOUT_COMBINED.zip
