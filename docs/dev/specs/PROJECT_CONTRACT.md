# Project Contract

## Purpose

`src/shared/contracts/projectContract.js` defines Project as the persisted ownership container for GameFoundryStudio work.

## Project Rules

- Every Project requires an owner.
- Every Project requires a project type.
- Every Project requires explicit visibility.
- Project type determines expected outputs, not ownership behavior.
- All project types share the same ownership, visibility, permissions, lifecycle, and ProjectWorkspace model.

## Lifecycle

Approved project states are draft, active, archived, published, marketplace, and retired.

Archived and retired projects cannot be edited unless explicit policy allows it.

## Relationships

Project may contain Tool States, Assets, Palettes, Game Manifest, Releases, and Marketplace Items.

## Validation

- Contract test: `tests/shared/ProjectContract.test.mjs`
- Fixture file: `tests/fixtures/projects/project-scenarios.json`
- Validation report: `docs/dev/reports/project_contract_tests_validation.md`
