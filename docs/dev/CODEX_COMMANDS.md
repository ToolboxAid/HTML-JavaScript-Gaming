MODEL: GPT-5.4
REASONING: high
COMMAND:
Implement BUILD_PR_LEVEL_12_8_NETWORK_DIRECTORY_NORMALIZATION exactly as defined from the reviewed src.zip baseline.
Apply the exact move-map under src/engine/network/.
Keep scope to directory normalization only.
Do not add features.
Do not leave duplicate legacy files behind.
Update imports and src/engine/network/index.js so the export surface remains stable where possible.
Run real validation:
- import/path resolution
- network runtime smoke boot
- transport/session lifecycle smoke
- authoritative runtime boot
- replication/apply smoke
- focused 2D regression smoke
Update docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md by changing status markers only.
Do not modify roadmap wording, structure, add content, or delete content.
