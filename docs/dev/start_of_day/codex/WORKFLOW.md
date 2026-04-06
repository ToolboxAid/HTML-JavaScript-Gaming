# Codex Workflow

## On Start
1. Read these files.
2. Treat start_of_day directories as locked.
3. Read the current BUILD doc.
4. Implement only that BUILD scope.
5. Stop immediately if the BUILD doc fails the execution threshold.

## During Work
- write code only where the BUILD doc says
- keep diffs small and surgical
- preserve project-specific ownership
- avoid speculative expansion

## When Finished
1. run required validation
2. report exact files changed
3. report validation results
4. package a repo-structured delta ZIP under `<project folder>/tmp/`
5. do not stage ZIP files from `<project folder>/tmp/`
6. stop after BUILD output is complete

## Do Not
- generate APPLY instructions unless explicitly requested
- redo planning
- modify roadmap wording
- touch start_of_day files
