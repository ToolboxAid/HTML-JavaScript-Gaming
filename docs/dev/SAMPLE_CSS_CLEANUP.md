Toolbox Aid
David Quesenberry
03/24/2026
SAMPLE_CSS_CLEANUP.md

# Sample CSS Cleanup

## Changes
- Replaced old stylesheet references with `baseLayout.css`
- Centralized shared styles in `samples/_shared/baseLayout.css`

## Required Updates
All sample HTML files should use:

<link rel="stylesheet" href="../_shared/baseLayout.css" />

## Notes
- Samples now use `samples/_shared/baseLayout.css`
- No functional changes expected
