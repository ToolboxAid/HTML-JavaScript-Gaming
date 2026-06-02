# Review Rating Contract

## Purpose

Review Rating records describe user-owned marketplace ratings and optional review text linked to a Marketplace Listing.

## Rules

- Every Review Rating requires `ownerId` and `projectId`.
- Every Review Rating requires a Marketplace Listing reference.
- Marketplace Listing `projectId` must match the Review Rating `projectId`.
- Rating must be an integer from 1 to 5.
- Visibility must be `private`, `public`, or `marketplace`.
- Review Rating records do not contain payment state, auth session state, runtime state, toolState, or moderation decision state.

## Validation

- Contract: `src/shared/contracts/reviewRatingContract.js`
- Test: `tests/shared/ReviewRatingContract.test.mjs`
- Fixture: `tests/fixtures/review-ratings/review-rating-scenarios.json`

