# PR_26171_018 Manual Validation Notes

## Startup Diagnostics Review
- Confirmed the old compact `.env loaded for API runtime (...)` line is not present in the captured startup diagnostics.
- Confirmed `.env` runtime variables print under the exact `Environment Variables` divider section.
- Confirmed variables are sorted alphabetically in the startup capture.
- Confirmed the runtime capture printed applied `.env` variables with `+`.
- Confirmed the existing startup logging assertion covers already-set variables with `-`.

## Port Diagnostics Review
- Confirmed startup diagnostics print the exact `All Runtime Ports being used by Service` divider section.
- Confirmed the runtime capture includes readable labels for live server, API server, configured API URL, DB/Postgres, Supabase, and storage ports.
- Confirmed missing optional ports are represented as `not configured` in the formatter test path.

## Secret Handling Review
- Confirmed secret-key values are masked as `********`.
- Confirmed database URL credentials are redacted before the URL is printed.
- Confirmed generated PR reports do not include raw secret values.
