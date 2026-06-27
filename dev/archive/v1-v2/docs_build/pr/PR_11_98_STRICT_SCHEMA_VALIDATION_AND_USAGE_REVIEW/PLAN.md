# PLAN_PR_LEVEL_11_98_STRICT_SCHEMA_VALIDATION_AND_USAGE_REVIEW

## Purpose
Tighten the project schema set so tool/workspace/sample/game payloads cannot contain fields that are not explicitly defined, then validate every place the schemas are used.

## Scope
- Review all schemas from `toolbox/schemas/**` and the attached schema set.
- Tighten schemas to reject unknown fields using `additionalProperties: false` at every object level where the contract is known.
- Replace loose `jsonValue` escape hatches with typed objects where the payload is owned by this repo.
- Update nested workspace/tool validation so each `tools.<toolId>` block is validated against its tool schema.
- Review and update all sample manifests/payloads under `samples/**`.
- Review and update all game manifests/payloads under `games/**`.
- Update code/loaders/tools that still expect old or loose schema shapes.
- Specifically include sample 1902 workspace validation and asset-browser flat assets alignment.

## Non-goals
- Do not change gameplay behavior.
- Do not delete assets.
- Do not create fallback/default payloads.
- Do not silently accept unknown fields.

## Required outcome
After this PR, unknown fields fail validation instead of being ignored.
