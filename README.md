Toolbox Aid
David Quesenberry
04/05/2026
README.md

# HTML-JavaScript-Gaming

This repository is a docs-first game/runtime workspace with a stable engine layer, advanced architecture layer, tools, samples, and PR-history documentation.

## Current Working Model
- Workflow: `PLAN_PR -> BUILD_PR -> APPLY_PR`
- One PR per purpose
- Small, surgical scope changes
- Build/apply delta ZIP outputs stored under `<project folder>/tmp/`

## Documentation Map
- [docs/README.md](docs/README.md): top-level documentation index
- `docs/pr/`: preserved PR history and architecture evolution
- `docs/dev/`: active workflow controls
- `docs/dev/reports/`: active report artifacts
- `docs/architecture/`: durable architecture and boundary contracts
- `docs/archive/`: archived dev-ops notes and generated reports

## Runtime Boundary Reminder
- Engine code remains in `engine/`.
- Advanced composable architecture remains in `src/advanced/`.
- Tools/samples/games consume public contracts and should not bypass engine boundaries.
