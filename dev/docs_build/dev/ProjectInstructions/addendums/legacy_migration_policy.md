# Legacy Migration Policy

## Purpose

Reduce technical debt incrementally during normal development.

## Migration Trigger

Migration review is required when any of these actions touch legacy files:

- File modified
- File renamed
- Bug fix
- Enhancement
- Test modification

## Migration Process

1. Review JS location.
2. Review CSS location.
3. Review test location.
4. Move touched files into canonical structure.
5. Update imports.
6. Update tests.
7. Remove legacy references.

## Rules

- Legacy files may only be deleted when no active references remain.
- Temporary bridge code must contain `TEMPORARY_MIGRATION` and a removal plan.
- No new scattered JS locations.
- No new scattered CSS locations.
- No new scattered test locations.
