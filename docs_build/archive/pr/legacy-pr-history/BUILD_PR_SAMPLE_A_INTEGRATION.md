Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_SAMPLE_A_INTEGRATION.md

# BUILD_PR_SAMPLE_A_INTEGRATION

## Build Summary
Integrated Sample A into the Games hub using the existing card markup and styling pattern.

## Implemented
1. Added one new card to `games/index.html`:
- href: `/games/network_sample_a/index.html`
- thumb: `/games/network_sample_a/assets/preview.svg`
- badges: `Playable Now` and `Debug Showcase`
- title: `Network Sample A (Debug Showcase)`
- concise showcase description

2. Reused/confirmed preview asset:
- `games/network_sample_a/assets/preview.svg`

## Scope Safety
- No engine-core changes.
- No layout structure changes.
- No nested links/buttons.
- Existing cards preserved in order.

## Validation
- Card exists in hub markup.
- Route target exists.
- Card conforms to existing anchor-card pattern.
