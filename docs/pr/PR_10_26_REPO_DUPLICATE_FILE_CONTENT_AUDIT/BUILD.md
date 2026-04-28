# BUILD_PR_10_26_REPO_DUPLICATE_FILE_CONTENT_AUDIT

## Required Codex Work

### 1. Add duplicate-content scan
Create or update a lightweight repo script that:
- walks repo files
- hashes file content
- groups exact byte-identical files
- writes JSON report

Preferred output:
docs/dev/reports/repo_duplicate_file_content_audit.json

### 2. Exclude noisy folders
Exclude at minimum:
- .git
- node_modules
- tmp
- dist
- build
- coverage
- .cache
- .next
- vendor folders if present

Do not exclude docs/dev/reports by default; report snapshots are important to find.

### 3. Report fields
Each duplicate group should include:
- hash
- byteSize
- fileCount
- paths
- suggestedClassification
- cleanupRisk

### 4. Add summary markdown
Create:
docs/dev/reports/PR_10_26_REPO_DUPLICATE_FILE_CONTENT_AUDIT_report.md

Include:
- total files scanned
- duplicate groups found
- high-risk groups
- report path
- explicit statement that no cleanup was performed

### 5. Validation
Run the audit and record output.

## Constraints
- Audit/report only.
- No file deletion.
- No file moves.
- No SSoT rewrites.
- No start_of_day changes.
