
MODEL: GPT-5.4
REASONING: high

COMMAND:
Create BUILD_PR_LEVEL_03_DUPLICATE_RENAME_COMBINED_PASS

1. Identify all getState variants
2. Bucket by domain:
   - simulation
   - replay
   - editor
   - other

3. Normalize naming:
   - getSimulationState
   - getReplayState
   - getEditorState

4. Classify duplicates:
   - sample
   - tool
   - runtime

5. Only move after classification

6. Close as many roadmap items as possible

7. Update roadmap status only

OUTPUT:
<project folder>/tmp/BUILD_PR_LEVEL_03_DUPLICATE_RENAME_COMBINED_PASS.zip
