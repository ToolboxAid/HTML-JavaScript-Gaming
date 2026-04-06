Toolbox Aid
David Quesenberry
04/06/2026
BUILD_PR_NETWORK_SAMPLE_A_INDEX_FIX.md

# BUILD_PR_NETWORK_SAMPLE_A_INDEX_FIX

## Build Summary
Applied a surgical index integration fix for Network Sample A in `games/index.html`.

## Implemented
1. Ensured a dedicated `Level 11 - Network Games` playable section is present.
2. Ensured `Network Sample A - Local Loopback / Fake Network` is visible as a card entry.
3. Preserved `Debug Showcase` labeling on the Sample A entry.
4. Kept card-level path references for Play/Debug and docs links as currently patterned.
5. Preserved existing section and card ordering outside this scope.

## Validation
- `games/index.html` contains `/games/network_sample_a/index.html`.
- Sample A card title is present.
- Level label is `Level 11 - Network Games`.
- No engine/runtime files were modified.
