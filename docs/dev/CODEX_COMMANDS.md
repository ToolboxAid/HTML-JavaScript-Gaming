MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute this atomic Level 13 package in order.

Step 1:
Treat docs/pr/PLAN_PR_RUNTIME_ASSET_LOADER.md as the governing architecture contract.

Step 2:
Create BUILD_PR_RUNTIME_ASSET_LOADER.

BUILD requirements:
- Implement a strict runtime asset loader for packaged project output
- Consume package manifest as runtime entry authority
- Enforce deterministic load sequencing
- Produce stable loader status/reporting
- Fail fast on invalid packaged input or missing required packaged assets
- Provide runtime bootstrap handoff for packaged projects
- Do not modify engine core APIs

Step 3:
Validate BUILD against docs/pr/BUILD_PR_RUNTIME_ASSET_LOADER.md.

Step 4:
Treat docs/pr/APPLY_PR_RUNTIME_ASSET_LOADER.md as the acceptance boundary and package results.

Package:
HTML-JavaScript-Gaming/tmp/LEVEL_13_RUNTIME_ASSET_LOADER_STRICT_ATOMIC_PACKAGE_delta.zip
