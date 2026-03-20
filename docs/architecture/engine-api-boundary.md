# Engine API Boundary Guide

## Purpose

Define the intended engine-facing API surface and prevent accidental leakage of internals.

## Boundary levels

### Public

Use for classes, functions, or modules that games and samples are allowed to depend on.

Public APIs should:

- be documented
- stay relatively stable
- avoid exposing internal storage or sequencing details

### Internal

Use for code shared across engine subsystems but not intended for consumer code.

Internal APIs may change more freely, but they should still be:

- named clearly
- consistent
- covered by tests where practical

### Private

Use for file-local or module-local details that can change at any time.

Private code should:

- stay hidden from games and samples
- avoid becoming de facto public through convenience imports

## Intended review questions

For each subsystem, identify:

- what is public
- what is internal
- what is private
- what consumers are using today
- what consumers should be using instead

## Stability rules

- Public API changes require explicit PR notes.
- Internal API changes require subsystem notes if they affect multiple folders.
- Private changes should stay local and not ripple outward.

## Migration guidance

When a current internal API is being treated as public by games or samples:

1. classify the usage
2. decide whether to promote or isolate it
3. add documentation or deprecation notes
4. migrate consumers in small PRs
