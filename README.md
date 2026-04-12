# HTML-JavaScript-Gaming

> Learn, build, and scale 2D → 3D browser games with a structured engine, integrated tools, and progressive samples.

A complete 2D and 3D browser game development and learning ecosystem built with HTML5 Canvas and modern JavaScript — featuring a reusable engine, playable games, interactive samples, integrated developer tools, and test frameworks.

This repository follows a docs-first game/runtime model, combining a stable engine layer, advanced composable architecture, structured learning samples, and a PR-driven development workflow.

![Docs First](https://img.shields.io/badge/workflow-docs--first-blue)
![2D to 3D](https://img.shields.io/badge/focus-2D%20%E2%86%92%203D-green)
![HTML5 Canvas](https://img.shields.io/badge/runtime-HTML5%20Canvas-orange)
![JavaScript](https://img.shields.io/badge/language-modern%20JavaScript-yellow)

---

## ✨ Features

- Reusable 2D → 3D browser game engine
- Structured learning samples with progressive complexity
- Integrated visual editors, inspectors, profiling, preview, and asset tools
- Playable game projects and sample-driven development
- Testable and repeatable engine and gameplay patterns
- Docs-first architecture with preserved PR history
- Clean separation between engine, advanced systems, tools, samples, and games
- Built for scale, maintainability, and long-term evolution

---

## ▶️ Start Here

1. Review the repo model in `docs/README.md`
2. Explore the roadmap in `docs/dev/BIG_PICTURE_ROADMAP.md`
3. Browse samples from `samples/index.html`
4. Explore tools under `tools/`
5. Review engine and architecture boundaries in `docs/architecture/`
6. Follow the workflow in `docs/dev/` and `docs/pr/`

---

## 🧰 Integrated Tools

This repository includes an active and growing integrated toolchain for authoring, previewing, profiling, inspecting, and supporting browser game development.

### Core creation tools
- Tilemap Studio
- Parallax Scene Studio
- Sprite Editor
- Vector Asset Studio
- Vector Map Editor

### Browsing, preview, and support tools
- Asset Browser
- Palette Browser
- Tool Host
- Preview tools
- Shared tool utilities

### Inspection and debugging tools
- State Inspector
- Replay Visualizer
- Performance Profiler
- Dev inspectors and command packs
- Server dashboard and development support tooling

These tools are part of the active workspace and are designed to support shared workflows, reusable assets, and engine-aligned development.

---

## 🎮 Samples & Games

- Progressive samples organized for learning and exploration
- Playable browser game projects
- Architecture and runtime pattern demonstrations
- Sample-driven validation of engine capabilities
- Foundation for expanding 2D systems and future 3D workflows

---

## 🧠 Learning Approach

This repo is designed as a learning system, not just a code dump.

- Learn through structured progression
- Build with reusable patterns instead of one-off implementations
- Study architecture boundaries alongside runtime behavior
- Use tools and samples together as part of the workflow
- Grow from simple examples into advanced systems

---

## 🏗️ Architecture Overview

- Engine Layer → `src/engine/`
- Advanced Systems → `src/advanced/`
- Tools, samples, and games consume public contracts only

Strict boundaries help preserve:
- Engine stability
- Clean extensibility
- Lower coupling
- Safer long-term evolution

---

## 🔄 Development Workflow

This project uses a structured PR workflow:

```text
PLAN_PR → BUILD_PR → APPLY_PR
```

- One PR per purpose
- Small, surgical changes
- Docs-first implementation planning
- Delta ZIP outputs stored under `<project folder>/tmp/`

---

## 📚 Documentation Map

- `docs/README.md` → top-level documentation index
- `docs/architecture/` → durable architecture and boundary contracts
- `docs/pr/` → preserved PR history and architecture evolution
- `docs/dev/` → active workflow controls and implementation planning
- `docs/dev/reports/` → active report artifacts
- `docs/archive/` → archived dev-ops notes and generated reports

---

## ⚠️ Runtime Boundary Rules

- Engine code lives in `src/engine/`
- Advanced systems live in `src/advanced/`
- Tools, samples, and games must use public contracts only
- Engine boundaries should not be bypassed

---

## 🔮 Roadmap Highlights

- Continue expanding 3D-aligned architecture and sample support
- Improve integration across tools and shared asset workflows
- Grow the learning path with richer sample coverage
- Strengthen preview, inspection, replay, and profiling workflows
- Continue normalizing boundaries across engine, tools, samples, and games

---

## 🤝 Philosophy

This project is built around:

- Learning by building
- Clean architecture over quick hacks
- Reusable systems over duplication
- Strong boundaries over hidden coupling
- Iterative growth through disciplined workflow

---

## 👤 Author

David Quesenberry
