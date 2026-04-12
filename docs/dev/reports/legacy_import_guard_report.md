# Legacy Engine Import Path Guard Report

Generated: 2026-04-12 15:57:09 -04:00
Scope: tools/src/games/samples/tests (excluding node_modules).

Result
- Guard status: PASS
- Total legacy signature matches: 0

Pattern Findings
- Pattern: '/engine/ | Matches: 0
- Pattern: "/engine/ | Matches: 0
- Pattern: '../engine/ | Matches: 0
- Pattern: "../engine/ | Matches: 0
- Pattern: './engine/ | Matches: 0
- Pattern: "./engine/ | Matches: 0
- Pattern: require('/engine/ | Matches: 0
- Pattern: require("/engine/ | Matches: 0
- Pattern: require('../engine/ | Matches: 0
- Pattern: require("../engine/ | Matches: 0
- Pattern: import('/engine/ | Matches: 0
- Pattern: import("/engine/ | Matches: 0
- Pattern: import('../engine/ | Matches: 0
- Pattern: import("../engine/ | Matches: 0

Command Pattern
- rg -n -F --glob '!**/node_modules/**' <pattern> tools src games samples tests

Notes
- This guard targets legacy signatures (/engine/, ../engine/, ./engine/) and excludes valid src/engine imports.
- If future matches appear, block cleanup/apply lanes until paths are normalized to src/engine.
