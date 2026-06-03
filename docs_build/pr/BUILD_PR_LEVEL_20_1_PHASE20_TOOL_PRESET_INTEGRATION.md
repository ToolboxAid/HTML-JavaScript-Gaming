# BUILD_PR_LEVEL_20_1_PHASE20_TOOL_PRESET_INTEGRATION

## Purpose
Create the Phase 20 executable lane for tool presets stored in the existing numbered samples structure.

## User-required structure
- samples must live under numbered phase folders
- Phase 20 uses `samples/phase-20`
- each sample must be a numbered folder matching repo sample conventions
- clicking a sample must open the matching tool with that sample's data already applied
- fullscreen is already complete and is out of scope

## In scope
- define numbered Phase 20 sample allocation for every listed tool
- add exactly 3 sample entries per tool
- wire tool discovery so the tool-facing picker reads Phase 20 sample folders
- define the launch contract so a selected sample opens the correct tool with its preset data
- keep naming and storage aligned to numbered sample structure only

## Out of scope
- fullscreen work
- adding a parallel per-tool sample directory tree
- changing earlier sample phases
- repo-wide cleanup
- unrelated tool UX changes

## Required repo structure
All Phase 20 samples for this PR live here:
- `samples/phase-20/2001`
- `samples/phase-20/2002`
- ...
- `samples/phase-20/2051`

Each numbered sample folder must contain only the minimal files needed by the existing repo conventions plus a small manifest or equivalent metadata already consistent with the repo's sample loading style. The implementation must not introduce a second competing sample structure.

## Phase placement
This belongs in **Phase 20** because it is a cross-tool executable sample lane that productizes the tools by making preset-driven entry points testable across the tool suite.

## Tool allocation
| Sample ID | Tool | Sample # | Repo folder |
|---|---|---:|---|
| 2001 | 3D Asset Viewer | 1 | `samples/phase-20/2001` |
| 2002 | 3D Asset Viewer | 2 | `samples/phase-20/2002` |
| 2003 | 3D Asset Viewer | 3 | `samples/phase-20/2003` |
| 2004 | 3D Camera Path Editor | 1 | `samples/phase-20/2004` |
| 2005 | 3D Camera Path Editor | 2 | `samples/phase-20/2005` |
| 2006 | 3D Camera Path Editor | 3 | `samples/phase-20/2006` |
| 2007 | 3D JSON Payload Normalizer | 1 | `samples/phase-20/2007` |
| 2008 | 3D JSON Payload Normalizer | 2 | `samples/phase-20/2008` |
| 2009 | 3D JSON Payload Normalizer | 3 | `samples/phase-20/2009` |
| 2010 | Asset Browser | 1 | `samples/phase-20/2010` |
| 2011 | Asset Browser | 2 | `samples/phase-20/2011` |
| 2012 | Asset Browser | 3 | `samples/phase-20/2012` |
| 2013 | Asset Pipeline Tool | 1 | `samples/phase-20/2013` |
| 2014 | Asset Pipeline Tool | 2 | `samples/phase-20/2014` |
| 2015 | Asset Pipeline Tool | 3 | `samples/phase-20/2015` |
| 2016 | Palette Browser | 1 | `samples/phase-20/2016` |
| 2017 | Palette Browser | 2 | `samples/phase-20/2017` |
| 2018 | Palette Browser | 3 | `samples/phase-20/2018` |
| 2019 | Parallax Scene Studio | 1 | `samples/phase-20/2019` |
| 2020 | Parallax Scene Studio | 2 | `samples/phase-20/2020` |
| 2021 | Parallax Scene Studio | 3 | `samples/phase-20/2021` |
| 2022 | Performance Profiler | 1 | `samples/phase-20/2022` |
| 2023 | Performance Profiler | 2 | `samples/phase-20/2023` |
| 2024 | Performance Profiler | 3 | `samples/phase-20/2024` |
| 2025 | Physics Sandbox | 1 | `samples/phase-20/2025` |
| 2026 | Physics Sandbox | 2 | `samples/phase-20/2026` |
| 2027 | Physics Sandbox | 3 | `samples/phase-20/2027` |
| 2028 | Replay Visualizer | 1 | `samples/phase-20/2028` |
| 2029 | Replay Visualizer | 2 | `samples/phase-20/2029` |
| 2030 | Replay Visualizer | 3 | `samples/phase-20/2030` |
| 2031 | Sprite Editor | 1 | `samples/phase-20/2031` |
| 2032 | Sprite Editor | 2 | `samples/phase-20/2032` |
| 2033 | Sprite Editor | 3 | `samples/phase-20/2033` |
| 2034 | State Inspector | 1 | `samples/phase-20/2034` |
| 2035 | State Inspector | 2 | `samples/phase-20/2035` |
| 2036 | State Inspector | 3 | `samples/phase-20/2036` |
| 2037 | Tile Model Converter | 1 | `samples/phase-20/2037` |
| 2038 | Tile Model Converter | 2 | `samples/phase-20/2038` |
| 2039 | Tile Model Converter | 3 | `samples/phase-20/2039` |
| 2040 | Tilemap Studio | 1 | `samples/phase-20/2040` |
| 2041 | Tilemap Studio | 2 | `samples/phase-20/2041` |
| 2042 | Tilemap Studio | 3 | `samples/phase-20/2042` |
| 2043 | Vector Asset Studio | 1 | `samples/phase-20/2043` |
| 2044 | Vector Asset Studio | 2 | `samples/phase-20/2044` |
| 2045 | Vector Asset Studio | 3 | `samples/phase-20/2045` |
| 2046 | Vector Map Editor | 1 | `samples/phase-20/2046` |
| 2047 | Vector Map Editor | 2 | `samples/phase-20/2047` |
| 2048 | Vector Map Editor | 3 | `samples/phase-20/2048` |
| 2049 | Workspace Manager | 1 | `samples/phase-20/2049` |
| 2050 | Workspace Manager | 2 | `samples/phase-20/2050` |
| 2051 | Workspace Manager | 3 | `samples/phase-20/2051` |

## Launch behavior contract
When a user clicks a Phase 20 sample:
1. the sample entry resolves from `samples/phase-20/<id>`
2. the sample metadata identifies the owning tool
3. the repo opens that tool directly
4. the tool loads the sample's preset data immediately
5. the user lands inside the tool already populated from that sample

## Execution rules
- smallest valid executable change
- one PR purpose only
- no new alternate sample path scheme
- no prose-only placeholder entries
- every Phase 20 sample entry added in this PR must be launchable and testable
- keep roadmap updates status-only

## Acceptance
- `samples/phase-20` exists and follows numbered folder conventions
- every listed tool has exactly 3 Phase 20 samples assigned
- every assigned Phase 20 sample can be clicked from the sample surface used by the repo
- the click opens the correct tool
- the correct preset data is applied on open
- fullscreen remains untouched
