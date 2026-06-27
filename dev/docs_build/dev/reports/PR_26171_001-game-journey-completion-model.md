# PR_26171_001 Game Journey Completion Model

## Scope
- Added a Game Journey completion metric model backed by a Local API route and SQLite persistence.
- Updated Game Journey UI surfaces to render numeric planned/completed counts and calculated completion percentages.
- Added active/inactive bucket status to the persisted completion model and admin/database table metadata.

## Implementation
- Added `game_journey_completion_metrics` SQLite persistence with 14 seeded Game Journey buckets, stable seed keys, planned counts, completed counts, calculated percentages, and active/inactive status.
- Added Local API routes:
  - `GET /api/game-journey/completion-metrics`
  - `POST /api/game-journey/completion-metrics/:bucketKey`
  - `PATCH /api/game-journey/completion-metrics/:bucketKey`
- Added a browser API client for completion metrics and re-exported it from the Game Journey client.
- Updated toolbox Game Journey accordions to use API-provided numeric labels instead of placeholder `xxx%` labels.
- Added a Game Journey completion metrics table view with bucket, planned, completed, percent, and status columns.
- Added database DDL/DML/seed metadata and mock DB schema/table ownership metadata for the new metrics table.
- Updated targeted Playwright expectations and added a Local API + SQLite persistence test.

## Notes
- No engine core files were modified.
- No `start_of_day` folders were modified.
- No `imageDataUrl` contract fields were added.
