# Marketplace Transaction Boundary Contract

## Purpose

Marketplace Transaction Boundary records describe the platform linkage around marketplace ownership changes without storing payment implementation, payment provider, or checkout state.

## Rules

- Every Marketplace Transaction Boundary requires `ownerId`, `projectId`, `marketplaceListing`, `entitlement`, `sourceRelease`, `sourcePublish`, `boundaryType`, `boundaryStatus`, and `createdAt`.
- Boundary type must be `purchaseIntent`, `licenseGrant`, `entitlementChange`, or `refundBoundary`.
- Boundary status must be `opened`, `recorded`, `voided`, or `closed`.
- Owner must match the linked Entitlement owner.
- Project, listing, entitlement, release, and publish references must remain linked.
- Marketplace Transaction Boundary records do not contain payment state, provider implementation details, auth session state, runtime state, or toolState.

## Validation

- Contract: `src/shared/contracts/marketplaceTransactionBoundaryContract.js`
- Test: `dev/tests/shared/MarketplaceTransactionBoundaryContract.test.mjs`
- Fixture: `dev/tests/fixtures/marketplace-transaction-boundaries/marketplace-transaction-boundary-scenarios.json`
