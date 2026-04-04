MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute this atomic Level 10 package in order.

Step 1:
Treat docs/pr/PLAN_PR_ASSET_VALIDATION_ENGINE.md as the governing architecture contract.

Step 2:
Create BUILD_PR_ASSET_VALIDATION_ENGINE.

BUILD requirements:
- Implement a shared enforced project-level asset validation engine
- Validate registry + dependency graph correctness
- Use deterministic finding generation and stable result structure
- Block guarded save/package/export actions when blocking findings exist
- Preserve remediation workflows for invalid and legacy projects
- Support Sprite Editor, Tile Map Editor, and Parallax Editor validation consumption
- Keep registry as source of truth
- Do not modify engine core APIs

Step 3:
Validate BUILD against docs/pr/BUILD_PR_ASSET_VALIDATION_ENGINE.md.

Step 4:
Treat docs/pr/APPLY_PR_ASSET_VALIDATION_ENGINE.md as the acceptance boundary and package results.

Package:
HTML-JavaScript-Gaming/tmp/LEVEL_10_ASSET_VALIDATION_ENGINE_ENFORCED_ATOMIC_PACKAGE_delta.zip
