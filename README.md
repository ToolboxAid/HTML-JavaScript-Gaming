# HTML-JavaScript-Gaming

A browser-based 2D engine repository focused on the current engine architecture, reusable engine code, and progressive samples.

## Repository layout

```text
engine/           Current reusable engine
samples/          Progressive samples (Sample01+)
tests/            Current engine test suite
docs/             Documentation
tools/            Utility applications
scripts/          Repository automation scripts
```

## Current architecture

- renderer-only drawing
- input only through InputService / ActionInputService
- scene lifecycle owned by engine
- progressive samples as the proof path
- ECS-oriented systems operating on data

## Running samples

Use a local web server from the repository root:

```bash
python -m http.server 8000
```

Then open a sample directly, for example:

```text
http://localhost:8000/samples/sample01-basic-loop/index.html
```

## Running tests

```bash
npm test
```

## Rules

See `RULES.txt` for the locked engine rules and scene contract.
