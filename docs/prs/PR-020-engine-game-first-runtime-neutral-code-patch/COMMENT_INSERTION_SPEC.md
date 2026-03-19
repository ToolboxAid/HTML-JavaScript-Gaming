PR-020 — comment insertion spec

### Allowed Insertion Type

The first code PR should add comment-only intent markers near the default export region in each target file.

### Supported Compatibility Surface Comment Pattern

Use wording shaped like:
- supported for current compatibility needs
- existing callers can continue relying on this surface
- current support does not imply a runtime change in this PR

Suitable files:
- `gameCollision.js`
- `gameObjectSystem.js`
- `gameUtils.js`

### Compatibility-Retained With Transition-Planning Posture Comment Pattern

Use wording shaped like:
- supported for current compatibility use
- existing callers remain supported
- future documentation posture may evolve
- no runtime change is implied here

Suitable files:
- `gameObjectManager.js`
- `gameObjectRegistry.js`
- `gameObjectUtils.js`

### Insertion Rule

Comments should be placed where maintainers reading the export surface will see them, but not in a way that creates stylistic churn or suggests code behavior has changed.
