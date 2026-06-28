# PR_26180_OWNER_012-update-ci-and-scripts Report

## Executive Summary

PR_26180_OWNER_012 updates CI, package scripts, and developer utilities for the current `www/`, `api/`, and `dev/` repository layout.

This PR is stacked on `PR_26180_OWNER_011-move-tests-and-validation`.

## Scope Decision

- Scope: CI, package scripts, and developer utilities only.
- No `www/` files moved.
- No `api/` files moved.
- No runtime product behavior changed.
- No production UI files changed.

## Changes

- Added `npm run validate:platform` as a package script for the platform validation suite.
- Updated the GitHub platform validation workflow to call the package script.
- Updated Node test runner absolute import aliases so `/assets/` and `/toolbox/` resolve through `www/` while `/src/` remains rooted at `src/`.
- Updated developer validation scripts to recognize `www/games/` and `www/toolbox/` paths.
- Updated tool registry validation messages to report current `www/toolbox/` locations.
- Updated Project Instructions version/status and repository architecture backlog status for PR_26180_OWNER_012.

## Dependency Order

- Previous PR: `PR_26180_OWNER_011-move-tests-and-validation`
- Current PR: `PR_26180_OWNER_012-update-ci-and-scripts`
- Next PR: `PR_26180_OWNER_013-remove-legacy-layout`
- Merge order: PR011, then PR012, then PR013.

## Owner Recommendation

Ready for review after validation passes and the draft PR is opened against `PR_26180_OWNER_011-move-tests-and-validation`.
