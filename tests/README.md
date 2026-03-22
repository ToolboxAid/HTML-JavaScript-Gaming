# Tests

Tests validate Engine boundaries before games are migrated.

Current strategy:

- small Node-based ES module tests for pure logic
- scene lifecycle tests without browser dependency
- samples remain the browser-facing proof

Run from repo root:

`node tests/run-tests.mjs`
