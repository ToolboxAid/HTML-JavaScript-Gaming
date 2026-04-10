# Codex Stop-and-Report Conditions

Stop and report instead of improvising if:

- the BUILD doc is vague
- target files are missing or contradictory
- the request would require roadmap rewrites
- implementation would touch engine core out of scope
- the change would require modifying start_of_day directories
- the PR purpose is no longer singular
- the BUILD asks for broad repo analysis without exact targets
- the BUILD mixes multiple objectives
- the BUILD uses vague language such as "clean up", "improve", or "modernize" without exact scope
- a Windows shell or PowerShell parse error occurs before execution
- the exact ZIP output path under `<project folder>/tmp/` is missing from the BUILD execution command
- the required ZIP cannot be produced at the requested path

Preferred behavior:
- stop
- explain exactly what is blocking execution
- do not expand scope on your own
- do not silently rerun with a rewritten shell command
- report the safer command/runtime to use next
