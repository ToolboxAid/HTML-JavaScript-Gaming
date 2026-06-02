# Review Rating Contract Tests Validation

PR: PR_26152_095-marketplace-trust-contract-tests

## Scope

- Added `src/shared/contracts/reviewRatingContract.js`.
- Added `tests/shared/ReviewRatingContract.test.mjs`.
- Added `tests/fixtures/review-ratings/review-rating-scenarios.json`.
- Added `docs/dev/specs/REVIEW_RATING_CONTRACT.md`.

## Lanes Executed

- contract - Review Rating contract validation.

## Lanes Skipped

- runtime - no runtime behavior changed.
- UI/CSS/HTML - no UI, CSS, or HTML files changed.
- samples - samples are out of scope.
- repo-wide tests - explicitly out of scope.

## Commands

- PASS: `node tests/shared/ReviewRatingContract.test.mjs`

## Expected PASS Behavior

- Valid Review Rating fixtures pass.
- Invalid fixtures reject missing owner/listing linkage, rating bounds, invalid visibility/status, and forbidden state leakage.

## Expected WARN Behavior

- None.

