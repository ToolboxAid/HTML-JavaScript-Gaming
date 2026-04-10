MODEL: GPT-5.4-codex
REASONING: high

COMMAND:
Execute BUILD_PR_SAMPLES_DISCOVERY_DATA_AND_FINDABILITY

ENVIRONMENT:
- Windows
- Node or vanilla JS only
- NO npm
- NO node_modules

RULES:
- Do not change canonical paths
- Do not modify gameplay or engine

VALIDATION:
- metadata validation triggers on bad data
- duplicate ids detected
- tags normalized
- filters/search still work

ZIP:
<project folder>/tmp/BUILD_PR_SAMPLES_DISCOVERY_DATA_AND_FINDABILITY.zip
