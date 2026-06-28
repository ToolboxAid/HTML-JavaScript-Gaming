# System Health Usage Reporting Foundation

Admin System Health separates service limits, current usage, and pressure calculation.

## Contract

- Configured limits come from the active `.env` file copied from the selected `.env.<target>` copy-source.
- Current usage is a service-contract value and may be `NOT AVAILABLE` or a numeric usage value.
- Pressure is calculated only when both a configured numeric limit and a numeric usage value exist.
- Missing or invalid limit configuration is a warning.
- `NOT AVAILABLE` usage is not a warning by itself.

## Pressure Labels

- `OK`
- `WATCH`
- `UPGRADE SOON`
- `RISK`

`RISK` is the highest concern label.

## Future Provider Integration Points

- R2 storage bytes: a future R2 provider telemetry adapter can report project asset storage bytes used through the Local API.
- R2 Class A operations: a future R2 provider telemetry adapter can report monthly Class A operation counts through the Local API.
- R2 Class B operations: a future R2 provider telemetry adapter can report monthly Class B operation counts through the Local API.
- Local DB size: a future Local DB telemetry adapter can report database bytes used through the Local API.
- Local DB connections: a future Local DB pool telemetry adapter can report active connection counts through the Local API.

Cloudflare billing integration is not required for the current foundation.
