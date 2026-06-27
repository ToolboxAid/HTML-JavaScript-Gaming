# Tool State Contract

## Purpose

`src/shared/contracts/toolStateContract.js` defines persisted saved editing state for one tool within one Project.

## Tool State Rules

- Tool State requires owner.
- Tool State requires project.
- Tool State requires tool type.
- Tool State requires explicit visibility.
- Tool State requires valid version and status.
- Archived Tool State records are immutable unless explicit policy allows edits.

## Recovery Rules

- Recovery State is separate from Current Saved State.
- Recovery State is temporary and user-selected.
- Recovery State never overwrites Saved State automatically.
- Resume opens Recovery State.
- Open opens Saved State.
- Recovery can be discarded or promoted to Saved State.

## Portable Format

Tool State export is a portable format. The database remains the working system, and exported Tool State data does not carry database ownership or project identifiers.

## Validation

- Contract test: `dev/tests/shared/ToolStateContract.test.mjs`
- Fixture file: `dev/tests/fixtures/tool-states/tool-state-scenarios.json`
- Validation report: `dev/docs_build/dev/reports/tool_state_contract_tests_validation.md`
