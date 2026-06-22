# All-Teams Governance Rule: Batch Governance Mode

Status: Approved  
Owner: OWNER  
Applies To: All teams

## Purpose

Increase throughput, reduce governance overhead, reduce review churn, and allow teams to spend more time building.

## Rules

1. Prefer workstream PRs for related governance, documentation, and administrative changes.
2. Avoid one-document-per-PR unless risk, dependency order, or OWNER direction requires it.
3. Review by workstream, not by individual file.
4. Minimize approval cycles.
5. Use stacked sequential PRs only when dependency order requires it.
6. Codex should provide one executable command package for the workstream.
7. Avoid repeated proceed confirmations.
8. Stop only for start gate failure, merge approval, conflict, or OWNER decision.
9. Standard review format:
   - changed code files
   - findings
   - PASS / FAIL
   - next action
10. Governance exists to enable delivery, not become the bottleneck.

## Default

Batch Governance Mode is the default operating mode for all teams unless OWNER explicitly overrides it.
