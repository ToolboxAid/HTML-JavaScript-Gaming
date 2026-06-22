Read this file first.

Folder purpose:
This folder is the append-first Project Instructions operating system for Game Foundry Studio. It organizes active governance, backlog, team assignment, deprecation, and history material without deleting or rewriting the existing Project Instructions files elsewhere in the repository.

Preservation rules:
Preserve all existing documentation. Add new files or append explicit references unless the owner explicitly approves deletion or rewrite. When a conflict appears, stop, explain the conflict, and request owner approval before changing existing instruction text.

Backlog workflow:
Backlog work is tracked under backlog/. BACKLOG_MASTER.md is the planned source for backlog item status, notes, and references. Backlog item text is treated as immutable once created; status and notes may change under the governance addendums.

Team assignment workflow:
Team assignments are tracked under team_assignments/. A team pulls work from BACKLOG_MASTER.md, marks the item building when assigned, and records the active assignment under the owning team. Teams work only on assigned items unless an OWNER override explicitly changes the assignment.

No direct commits to main:
Do not commit directly to main unless the owner explicitly instructs that exception. Normal work must use PR branches, draft PRs, validation evidence, and owner-controlled merge approval.

OWNER override rule:
An OWNER override must use this wording:
OWNER override approved: <reason>

The override must explain why normal team, branch, assignment, or backlog routing is being changed.

History snapshot rule:
When a governance or instruction state needs a history snapshot, add a new file under archive/history/ using:
CCYYMMDD_HHMMSS.md

Do not rewrite history snapshots after creation unless the owner explicitly approves.

READ THIS FIRST

1. Read Project Instructions before making changes.
2. Project Instructions are append-only.
3. Existing approved guidance may not be removed.
4. Team ownership must be respected.
5. BACKLOG_MASTER.md is the authoritative backlog.
6. Build Path status derives from backlog status.
7. Direct-to-main commits are prohibited.
8. Use approved PR workflow.
9. Follow OWNER governance decisions.
10. When guidance conflicts, newest OWNER-approved guidance wins.
11. Batch Governance Mode is the default for governance, documentation, and administrative work.
