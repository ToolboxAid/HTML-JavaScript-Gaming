# Docs Index

This folder contains the project operating docs for reviewing, maintaining, and evolving `ToolboxAid/HTML-JavaScript-Gaming`.

## Core docs

- [START_SESSION.md](./START_SESSION.md) — lightweight command protocol for ChatGPT review and PR sessions.
- [PR_WORKFLOW.md](./PR_WORKFLOW.md) — pull request rules, risk levels, and templates.
- [REVIEW_CHECKLIST.md](./REVIEW_CHECKLIST.md) — repeatable scoring rubric for file and subsystem reviews.
- [ENGINE_STANDARDS.md](./ENGINE_STANDARDS.md) — architecture and boundary rules for the engine.
- [ENGINE_API.md](./ENGINE_API.md) — intended public API boundary and stability guidance.
- [performance.md](./performance.md) — performance review rules, hot-path heuristics, and optimization workflow.

## Living review docs

- [reviews/architecture-review-v1.md](./reviews/architecture-review-v1.md) — current architecture review state and findings.
- [reviews/pr-roadmap.md](./reviews/pr-roadmap.md) — ordered PR execution list.

## Decisions

- [decisions/001-runtime-context-boundary.md](./decisions/001-runtime-context-boundary.md) — first ADR template/example for runtime ownership.

## Suggested workflow

1. Start each review chat with the short command in `START_SESSION.md`.
2. Review one scope at a time using `REVIEW_PASS`.
3. Record findings in `reviews/architecture-review-v1.md`.
4. Convert validated findings into small PRs in `reviews/pr-roadmap.md`.
5. Use `PR_WORKFLOW.md`, `REVIEW_CHECKLIST.md`, and `ENGINE_STANDARDS.md` during implementation and review.
