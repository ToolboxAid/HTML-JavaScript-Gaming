MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_ASSET_PIPELINE_FOUNDATION as the next follow-up to project-level tool integration.

Scope:
- establish a minimal shared asset-pipeline foundation
- target only ingest/normalize/validate/register stages
- reuse existing tools/shared asset/project helpers first
- active tools only
- minimal adapters only
- no UI/theme work
- no editor-state redesign
- no render-pipeline changes
- no converter suite in this PR
- do not touch templates/ cleanup in this PR

Validation:
- npm run test:launch-smoke -- --tools
- verify touched tools still ingest/load assets
- report exact files changed
- report normalized asset rules and adapters

Output:
<project folder>/tmp/BUILD_PR_ASSET_PIPELINE_FOUNDATION_delta.zip
