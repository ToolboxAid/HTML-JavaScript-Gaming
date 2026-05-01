
Model: GPT-5.4
Reasoning: high

Disable assetUsageIntegration in hosted mode.

Modify:
tools/shared/assetUsageIntegration.js

- Add hosted guard to ALL read/write functions
- No fallback logic

Validate with node --check
