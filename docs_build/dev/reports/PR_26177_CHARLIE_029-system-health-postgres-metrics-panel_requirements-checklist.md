# PR_26177_CHARLIE_029-system-health-postgres-metrics-panel Requirement Checklist

- PASS: Add/extend System Health Postgres metrics panel.
- PASS: Include connection status.
- PASS: Include database name.
- PASS: Include current schema/migration status when available.
- PASS: Include table count when available.
- PASS: Include database size when available.
- PASS: Do not add expensive queries.
- PASS: Show explicit Unavailable status when a metric is unavailable.
- PASS: Do not expose secrets.
- PASS: Keep browser UI consuming API/service contract.
- PASS: No cross-environment checks added.
- PASS: No start_of_day files modified.
