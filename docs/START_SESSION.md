# ToolboxAid Dev Protocol v1

## Purpose

Standard command interface for working with ChatGPT on:

- architecture review
- code review
- PR planning
- refactoring
- performance analysis
- API boundary review

## Daily starter

Use this short block at the start of a new chat session:

```text
COMMAND: START_SESSION
REPO: ToolboxAid/HTML-JavaScript-Gaming
SCOPE: full
FOCUS: architecture
OUTPUT: review_state, plan, tasks
```

## Command structure

```text
COMMAND: <action>
REPO: <owner/repo>
SCOPE: <area>
FOCUS: <analysis type>
OUTPUT: <response type>
```

## Field reference

### COMMAND

Core commands:

- `START_SESSION` — initialize workflow
- `REVIEW_PASS` — analyze a specific scope
- `FIND_RISK` — identify high-risk areas
- `LIST_API` — list public, internal, and private APIs
- `TRACE_FLOW` — follow execution paths such as update/render flow
- `BUILD_PR` — generate PR title, description, and patch guidance
- `PLAN_PR` — design a PR without code changes
- `SUMMARIZE` — summarize findings
- `COMPARE` — compare files, patterns, or approaches
- `REFACTOR` — propose structure improvements

Advanced commands:

- `ENFORCE_RULES`
- `CHECK_CONSISTENCY`
- `MAP_DEPENDENCIES`
- `VALIDATE_BOUNDARIES`

### REPO

Format:

- `owner/repo`

Examples:

- `ToolboxAid/HTML-JavaScript-Gaming`
- `myorg/my-engine`
- `local-upload`

### SCOPE

Broad scopes:

- `full`
- `engine`
- `games`
- `samples`
- `tests`
- `docs`
- `tools`

Folder examples:

- `engine/core`
- `engine/render`
- `engine/physics`
- `engine/lifecycle`

File examples:

- `engine/core/gameBase.js`
- `engine/game/objectRegistry.js`

Logical scopes:

- `runtime`
- `collision`
- `render_loop`
- `object_lifecycle`
- `input_pipeline`

### FOCUS

Architecture:

- `architecture`
- `design`
- `coupling`

Code quality:

- `bugs`
- `edge_cases`
- `consistency`
- `cleanup`

Performance:

- `performance`
- `memory`
- `rendering`
- `physics`

Behavior:

- `lifecycle`
- `collision`
- `input`
- `timing`

Refactor:

- `refactor`
- `modernize`
- `simplify`

### OUTPUT

Review outputs:

- `review_state`
- `findings`
- `risks`
- `summary`

Planning outputs:

- `plan`
- `tasks`
- `roadmap`
- `pr_candidates`

PR outputs:

- `pr_plan`
- `diff`
- `description`
- `title`
- `tests`

Deep analysis outputs:

- `dependency_map`
- `call_flow`
- `api_surface`
- `boundary_map`

## Review rules

- One PR = one concern.
- Do not mix refactor, bug fixes, performance work, and formatting in the same PR.
- Distinguish **public**, **internal**, and **private** code.
- Treat `engine/` as a reusable framework first.
- Use `games/` and `samples/` to validate whether the engine API is working.
- Prefer small, low-risk, easily reviewable changes.

## Standard workflow

1. Start with `START_SESSION`.
2. Run `REVIEW_PASS` by subsystem.
3. Record findings in `reviews/architecture-review-v1.md`.
4. Build PR candidates in `reviews/pr-roadmap.md`.
5. Apply `PR_WORKFLOW.md`, `REVIEW_CHECKLIST.md`, `ENGINE_STANDARDS.md`, and `performance.md` as needed.
