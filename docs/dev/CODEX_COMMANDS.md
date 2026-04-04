MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute this atomic Level 15 package in order.

Step 1:
Treat docs/pr/PLAN_PR_PLATFORM_VALIDATION_SUITE.md as the governing architecture contract.

Step 2:
Create BUILD_PR_PLATFORM_VALIDATION_SUITE.

BUILD requirements:
- Implement a repeatable platform validation suite for accepted system flows
- Cover golden-path, failure-path, remediation, packaging, runtime, streaming, plugin, and versioning scenarios
- Produce stable, readable validation reports
- Preserve accepted platform boundaries
- Do not modify engine core APIs

Step 3:
Validate BUILD against docs/pr/BUILD_PR_PLATFORM_VALIDATION_SUITE.md.

Step 4:
Treat docs/pr/APPLY_PR_PLATFORM_VALIDATION_SUITE.md as the acceptance boundary and package results.

Package:
HTML-JavaScript-Gaming/tmp/LEVEL_15_PLATFORM_VALIDATION_SUITE_delta.zip
