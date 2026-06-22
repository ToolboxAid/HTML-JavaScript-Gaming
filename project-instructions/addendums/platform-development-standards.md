# Platform Development Standards

## Purpose

Establish repository-wide standards for database usage, entity lifecycle management, creator tool design, and shared component reuse.

---

# PostgreSQL Platform Standard

## Rules

- SQLite is deprecated.
- PostgreSQL is the canonical database platform.
- New development must not introduce SQLite.
- New tools must target PostgreSQL.
- New tests must target PostgreSQL.
- New migrations must target PostgreSQL.

## Legacy

Existing SQLite references should be removed when touched by active development.

## Exception

Owner approval is required for any non-PostgreSQL database implementation.

---

# Referenced Entity Protection

## Purpose

Prevent accidental data loss and broken references.

## Rules

Entities referenced by another record may not be directly deleted.

Allowed actions:

- Archive
- Deprecate
- Replace

Direct deletion is prohibited while references exist.

## Examples

- Messages
- TTS Profiles
- Emotion Profiles
- Characters
- Objects
- Assets
- Worlds
- Tags

## Exception

Owner approval required for destructive removal.

---

# Table First Tool Standard

## Purpose

Provide a consistent creator experience across all tools.

## Preferred

- Table driven interfaces
- Inline editing
- Add row at bottom
- Expandable child rows
- Save and Cancel on the active row

## Avoid

- Large data-entry forms
- Separate edit pages
- Wizard-style CRUD workflows

## Exception

Forms may be used when table interaction is not practical.

---

# Shared Component Governance

## Purpose

Reduce duplicate code across tools.

## Shared JavaScript Location

```text
assets/js/shared/
```

## Examples

- API helpers
- Table helpers
- Status helpers
- Dialog helpers
- Validation helpers

## Rules

Functionality used by multiple tools should be moved into shared components.

Tool-specific functionality remains within the tool folder.

Shared functionality must not be stored inside an unrelated tool folder.

## Testing

Shared functionality must include tests under:

```text
tests/js/shared/
```

Tool-specific functionality remains tested within its corresponding tool test location.

---

# Governance Enforcement

## Rules

New development must follow these standards.

When modifying existing functionality:

1. Review compliance with these standards.
2. Correct violations when practical within the scope of the work.
3. Avoid introducing new technical debt.

Repository-wide standards must exist in Project Instructions and not solely within chat discussions.
