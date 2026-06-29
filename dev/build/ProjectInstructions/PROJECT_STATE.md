# Project State

```yaml
project_state_version: "2026.06.28.018"
last_updated: "2026-06-28"
current_main_commit: "40de767476d70cadfd1292c916844c2f31b6f185"
repository_status:
  state: "active"
  governance_source: "dev/build/ProjectInstructions/"
  runtime_database: "Postgres"
  creator_metadata: "API to Postgres"
  creator_assets: "API to R2"
project_instructions_version: "2026.06.28.018"
repository_structure_version: "2026.06.28.018"
canonical_layout_version: "2026.06.28.018"
active_teams:
  - "Owner"
  - "Alfa"
  - "Bravo"
  - "Charlie"
  - "Delta"
  - "Golf"
latest_owner_pr: "PR_26180_OWNER_018-move-src-browser-to-www"
latest_structure_pr: "PR_26180_OWNER_018-move-src-browser-to-www"
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
  - "API/server-owned contracts, schemas, and project data store modules remain under src/shared/ until PR_26180_OWNER_019 moves them to api/."
  - "Developer/source reference files remain under src/ until PR_26180_OWNER_020 moves them to dev/."
  - "src/dev-runtime/admin/.gitkeep remains as a placeholder until PR_26180_OWNER_021 retires the empty root src folder."
  - "repository_directory_standard.md and codex_project_instructions_startup.md are superseded pointers retained for compatibility."
```
