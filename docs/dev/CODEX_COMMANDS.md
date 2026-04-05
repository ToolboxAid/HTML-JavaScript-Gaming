MODEL: GPT-5.4
REASONING: high

COMMAND:
Execute this final release verification suite in order.

Step 1:
Verify and apply vector-only runtime acceptance.
- Confirm `sprite.asteroids-demo` is no longer an active packaged/runtime dependency
- Confirm validation/package/runtime/debug/profiler/export/publishing remain ready
- Package as APPLY_PR_VECTOR_ONLY_RUNTIME_VERIFIED

Step 2:
Verify and apply vector-native template sample-game acceptance.
- Confirm standalone sample validates/packages/runs with vector-only assets
- Confirm no sprite fallback dependency is present
- Package as APPLY_PR_VECTOR_TEMPLATE_SAMPLE_GAME_VERIFIED

Step 3:
Verify and apply deterministic vector geometry runtime acceptance.
- Confirm repeated runs are deterministic
- Confirm geometry participation is visible in debug/profiler outputs
- Package as APPLY_PR_VECTOR_GEOMETRY_RUNTIME_VERIFIED

Step 4:
Treat docs/pr/PLAN_PR_PUBLIC_PLATFORM_SHOWCASE.md as the governing contract for the final public-facing showcase.
- Build the showcase plan and supporting release-ready assets
- Keep claims aligned to verified technical evidence
- Package as BUILD_PR_PUBLIC_PLATFORM_SHOWCASE

Global requirements:
- Preserve accepted platform boundaries
- Do not modify engine core APIs
- Keep docs/dev authoritative
- Package outputs to repo tmp using established conventions

Package:
HTML-JavaScript-Gaming/tmp/FINAL_RELEASE_PATH_AND_VERIFICATION_SUITE_delta.zip
