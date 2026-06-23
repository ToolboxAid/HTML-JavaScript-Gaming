# PR_26174_ALFA_001-idea-board-create-project-api-contract

## Purpose

Wire Idea Board Create Project through the Local API/service contract.

## Summary

- Added an explicit Local API session check before Idea Board calls the Game Hub `createGame` repository method.
- Redirects unauthenticated guests to `account/sign-in.html` before any project create request is sent.
- Preserves the server/API create contract: browser sends name, purpose, sourceIdea, and status only; no browser-owned project key is sent.
- Extended targeted Playwright coverage for Ready-only create controls, non-Ready rows, converted read-only behavior, guest redirect, and API payload shape.

## Validation

PASS - `npx playwright test tests/playwright/tools/IdeaBoardTableNotes.spec.mjs`
