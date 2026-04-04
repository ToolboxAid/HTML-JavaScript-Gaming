MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute this clean vector-only progression in order.

Step 1:
Treat docs/pr/PLAN_PR_VECTOR_ONLY_RUNTIME.md as the governing architecture contract.

Step 2:
Create BUILD_PR_VECTOR_ONLY_RUNTIME.

BUILD requirements:
- Remove `sprite.asteroids-demo` as an active packaged/runtime dependency for the Asteroids demo
- Enforce vector-only visual requirements for ship, asteroid variants, and title treatment where configured
- Preserve strict validation, packaging, runtime, debug, profiler, export, and publishing flows
- Keep deterministic behavior stable
- Preserve runtime handoff at `games/Asteroids/main.js#bootAsteroids`
- Do not modify engine core APIs
- Keep rollback notes documented, but do not keep sprite fallback as active runtime dependency

Step 3:
Validate BUILD against docs/pr/BUILD_PR_VECTOR_ONLY_RUNTIME.md.

Step 4:
Treat docs/pr/APPLY_PR_VECTOR_ONLY_RUNTIME.md as the acceptance boundary and package results.

Package:
HTML-JavaScript-Gaming/tmp/VECTOR_ONLY_RUNTIME_PR_BUNDLE_delta.zip
