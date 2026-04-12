MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_ASSET_PIPELINE_VALIDATION_OUTPUT

Scope:
- add validation stage
- add export/output stage
- integrate with pipeline

Validation:
- npm run test:launch-smoke -- --tools
- verify assets validate and export

Output:
<project>/tmp/BUILD_PR_ASSET_PIPELINE_VALIDATION_OUTPUT_delta.zip
