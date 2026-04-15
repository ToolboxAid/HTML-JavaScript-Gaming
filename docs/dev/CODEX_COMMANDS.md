MODEL: GPT-5.4
REASONING: high
COMMAND:
Implement BUILD_PR_LEVEL_12_9_NETWORK_USAGE_SAMPLE_STANDARDIZATION exactly as defined.
Standardize the targeted phase-13 sample scenes so they consume the network API via src/engine/network/index.js only.
Remove deep or legacy flat network-path usage in the targeted sample set where present.
Do not change sample behavior, controls, timing, outputs, or runtime logic.
If needed, update src/engine/network/index.js export coverage so sample behavior stays unchanged.
Run real validation:
- import/path resolution for all targeted samples
- network runtime smoke boot
- transport/session lifecycle smoke
- authoritative runtime boot smoke
- replication/apply smoke
- focused 2D regression smoke
Update docs/dev/roadmaps/MASTER_ROADMAP_HIGH_LEVEL.md by changing status markers only.
Do not modify roadmap wording, structure, add content, or delete content.
