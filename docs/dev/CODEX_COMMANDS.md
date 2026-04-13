MODEL: GPT-5.3-codex
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_11_1_AUTHORITATIVE_STATE_HANDOFF_CANDIDATE implementation from provided payload.

INPUT:
Use provided ZIP payload.

REQUIREMENTS:
- Implement authoritative state handoff per PR intent
- Maintain strict separation engine/game
- Use approved selectors/events only
- No engine core API changes unless required
- Preserve backward compatibility
- Add contract validation

CONSTRAINTS:
- Minimal, surgical changes only
- No unrelated modifications

OUTPUT (CRITICAL):
- Provide ONE download ZIP (delta only)
- Repo-structured
- Only changed/added files
- No full repo copies

ALSO INCLUDE:
- docs/dev/commit_comment.txt
- docs/dev/next_command.txt
