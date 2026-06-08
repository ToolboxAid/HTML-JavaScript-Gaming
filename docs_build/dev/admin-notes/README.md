# Admin Notes Ownership

Admin Notes are dev-only documentation artifacts.

Owned paths:
- `docs_build/dev/admin-notes/index.txt` is the root admin note.
- `docs_build/dev/admin-notes/other/index.txt` is the simple subnote fixture.
- `docs_build/dev/admin-notes/quick-reference.txt` is a linked text-note fixture.
- `docs_build/dev/admin-notes/sample.txt` is a root-relative link example note.
- `docs_build/dev/admin-notes/notes/index.txt` is retained historical admin-note content.

Runtime boundary:
- Admin Notes viewer implementation, when needed for local/dev inspection, belongs under `src/dev-runtime/admin/`.
- Production-facing paths must not link to or fetch `docs_build/dev/admin-notes/`.
- UAT/PROD bundles must not import `src/dev-runtime/admin/`.
