# Project State

```yaml
project_state_version: "2026.06.28.009"
last_updated: "2026-06-28"
current_main_commit: "40de767476d70cadfd1292c916844c2f31b6f185"
repository_status:
  state: "active"
  governance_source: "dev/build/ProjectInstructions/"
  runtime_database: "Postgres"
  creator_metadata: "API to Postgres"
  creator_assets: "API to R2"
project_instructions_version: "2026.06.28.009"
repository_structure_version: "2026.06.28.009"
canonical_layout_version: "2026.06.28.009"
active_teams:
  - "Owner"
  - "Alfa"
  - "Bravo"
  - "Charlie"
  - "Delta"
  - "Golf"
latest_owner_pr: "PR_26180_OWNER_009-move-api-application"
latest_structure_pr: "PR_26180_OWNER_009-move-api-application"
valid_top_level_folders:
  - "api/"
  - "deploy/"
  - "dev/"
  - "src/"
  - "www/"
valid_dev_folders:
  - "dev/archive/"
  - "dev/build/"
  - "dev/config/"
  - "dev/local-runtime/"
  - "dev/reports/"
  - "dev/scripts/"
  - "dev/templates/"
  - "dev/tests/"
  - "dev/tools/"
  - "dev/workspace/"
known_technical_debt:
  - "Browser API client modules remain under src/api/ until the final src layer migration moves them into src/web/ or src/runtime/."
  - "src/dev-runtime/admin/ remains as a legacy Admin Notes browser-viewer compatibility path until a scoped browser admin migration retires it."
  - "repository_directory_standard.md and codex_project_instructions_startup.md are superseded pointers retained for compatibility."
```
