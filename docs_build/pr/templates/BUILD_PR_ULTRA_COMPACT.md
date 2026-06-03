# BUILD_PR_<NAME>

## Purpose
<1 sentence>

## Files
- <file1>
- <file2>

## Changes
- <change1>
- <change2>

## Validation
- <command1>
- <command2>

## Rules
- no engine changes
- strict scope
- stop on ambiguity

## Output
<project>/tmp/<NAME>_delta.zip

## Generated Response Support
When generated docs/templates include a commit comment, render it in a copy-friendly control/button pattern:

```html
<div class="copy-control" data-copy-kind="commit-comment">
  <label for="commitCommentText">Commit comment</label>
  <textarea id="commitCommentText" readonly><description> - <PR info></textarea>
  <button type="button" data-copy-target="commitCommentText">Copy commit comment</button>
</div>
```
